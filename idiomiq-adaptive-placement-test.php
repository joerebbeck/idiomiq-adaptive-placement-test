<?php
/**
 * Plugin Name: IdiomIQ Adaptive Placement Test
 * Plugin URI:  https://idiomiq.com/iiqapt/
 * Description: Adaptive CEFR placement test (A2–C2) for schools and educators. Preconfigured English bank; Bayesian IRT for efficiency and more accurate results.
 * Version:     1.3.5
 * Author:      IdiomIQ
 * Author URI:  https://idiomiq.com
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: idiomiq-adaptive-placement-test
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'IIQAPT_VERSION', '1.3.5' );
define( 'IIQAPT_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );

require_once IIQAPT_PLUGIN_PATH . 'includes/cefr-colors.php';
require_once IIQAPT_PLUGIN_PATH . 'includes/db.php';
require_once IIQAPT_PLUGIN_PATH . 'includes/ajax.php';
require_once IIQAPT_PLUGIN_PATH . 'includes/admin-settings.php';

function iiqapt_activate() {
    iiqapt_create_questions_table();
    iiqapt_insert_sample_questions();
}
register_activation_hook( __FILE__, 'iiqapt_activate' );

function iiqapt_deactivate() {
    wp_clear_scheduled_hook( 'iiqapt_daily_log_cleanup' );
}
register_deactivation_hook( __FILE__, 'iiqapt_deactivate' );

function iiqapt_uninstall() {
    if ( ! get_option( 'iiqapt_delete_on_uninstall' ) ) {
        return;
    }

    global $wpdb;
    // phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.SchemaChange, WordPress.DB.DirectDatabaseQuery.NoCaching -- uninstall is a one-time destructive operation; caching is irrelevant.
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}iiqapt_attempt_logs" );
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}iiqapt_questions" );
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}iiqapt_question_banks" );
    // phpcs:enable

    $options = [
        'iiqapt_delete_on_uninstall',
        'iiqapt_rate_limit',
        'iiqapt_max_batches',
        'iiqapt_log_retention_days',
        'iiqapt_primary_color',
        'iiqapt_target_error',
        'iiqapt_strong_label',
        'iiqapt_borderline_label',
        'iiqapt_email_subject',
        'iiqapt_email_body',
        'iiqapt_admin_email',
        'iiqapt_admin_email_subject',
        'iiqapt_admin_email_body',
        'iiqapt_email_footer',
        'iiqapt_start_title',
        'iiqapt_start_subtitle',
        'iiqapt_start_body',
        'iiqapt_start_email_placeholder',
        'iiqapt_start_button_text',
        'iiqapt_start_gdpr2',
        'iiqapt_start_gdpr2_message',
        'iiqapt_during_progress',
        'iiqapt_during_question',
        'iiqapt_during_counter',
        'iiqapt_during_options',
        'iiqapt_during_selected',
        'iiqapt_during_dyslexic',
        'iiqapt_during_loading',
        'iiqapt_during_analysing',
        'iiqapt_during_dyslexic_off',
        'iiqapt_during_dyslexic_on',
        'iiqapt_show_error_rate',
        'iiqapt_error_rate_label',
        'iiqapt_error_rate',
        'iiqapt_after_title',
        'iiqapt_after_subheading',
        'iiqapt_after_body',
        'iiqapt_after_retake',
        'iiqapt_db_version',
    ];

    foreach ( $options as $option ) {
        delete_option( $option );
    }

    wp_clear_scheduled_hook( 'iiqapt_daily_log_cleanup' );
}
register_uninstall_hook( __FILE__, 'iiqapt_uninstall' );

function iiqapt_schedule_cleanup() {
    if ( ! wp_next_scheduled( 'iiqapt_daily_log_cleanup' ) ) {
        wp_schedule_event( time(), 'daily', 'iiqapt_daily_log_cleanup' );
    }
}
add_action( 'wp_loaded', 'iiqapt_schedule_cleanup' );

function iiqapt_run_log_cleanup() {
    $days = absint( get_option( 'iiqapt_log_retention_days', 90 ) );
    if ( $days < 1 ) {
        return;
    }
    global $wpdb;
    $logs_table = $wpdb->prefix . 'iiqapt_attempt_logs';
    $wpdb->query( $wpdb->prepare( "DELETE FROM {$logs_table} WHERE date < DATE_SUB(NOW(), INTERVAL %d DAY)", $days ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- $logs_table is $wpdb->prefix . hardcoded literal, not user input.
}
add_action( 'iiqapt_daily_log_cleanup', 'iiqapt_run_log_cleanup' );

function iiqapt_update_db_check() {
    if ( get_option( 'iiqapt_db_version' ) !== '1.5.1' ) {
        iiqapt_create_questions_table();
        update_option( 'iiqapt_db_version', '1.5.1' );
    }
}
add_action( 'plugins_loaded', 'iiqapt_update_db_check' );

function iiqapt_shortcode( $atts ) {
    $atts = shortcode_atts( [ 'bank' => 1 ], $atts, 'iiqapt' );
    ob_start();
    set_query_var( 'iiqapt_bank_id', intval( $atts['bank'] ) );
    include IIQAPT_PLUGIN_PATH . 'templates/quiz-container.php';
    return ob_get_clean();
}
add_shortcode( 'iiqapt', 'iiqapt_shortcode' );

function iiqapt_enqueue_scripts() {
    if ( ! is_a( get_post(), 'WP_Post' ) || ! has_shortcode( get_post()->post_content, 'iiqapt' ) ) {
        return;
    }

    wp_enqueue_style(
        'iiqapt-style',
        plugin_dir_url( __FILE__ ) . 'assets/css/iiqapt-style.css',
        [],
        IIQAPT_VERSION
    );

    wp_enqueue_script(
        'iiqapt-script',
        plugin_dir_url( __FILE__ ) . 'assets/js/iiqapt-script.js',
        [],
        IIQAPT_VERSION,
        true
    );

    $data = [
        'ajax_url'         => admin_url( 'admin-ajax.php' ),
        'nonce'            => wp_create_nonce( 'iiqapt_nonce' ),
        'target_error'     => max( 1, (int) get_option( 'iiqapt_target_error', 8 ) ),
        'show_error_rate'  => (int) get_option( 'iiqapt_show_error_rate', 1 ),
        'error_rate_label' => wp_kses_post( get_option( 'iiqapt_error_rate_label', '' ) ),
        'i18n'             => [
            'valid_email'      => __( 'Please enter a valid email address.', 'idiomiq-adaptive-placement-test' ),
            'error_loading'    => __( 'Error loading test.', 'idiomiq-adaptive-placement-test' ),
            'connection_error' => __( 'Connection Error', 'idiomiq-adaptive-placement-test' ),
            'analyzing'        => get_option( 'iiqapt_during_analysing', __( 'Analysing your answers...', 'idiomiq-adaptive-placement-test' ) ),
            'test_complete'    => wp_kses_post( get_option( 'iiqapt_after_title',      __( 'Test Complete', 'idiomiq-adaptive-placement-test' ) ) ),
            'estimated_level'  => wp_kses_post( get_option( 'iiqapt_after_subheading', __( 'Your estimated English level is:', 'idiomiq-adaptive-placement-test' ) ) ),
            'email_sent'       => wp_kses_post( get_option( 'iiqapt_after_body',       __( 'A copy of your results has been sent to your email.', 'idiomiq-adaptive-placement-test' ) ) ),
            'error_submitting' => __( 'Error submitting answers.', 'idiomiq-adaptive-placement-test' ),
            'refresh_retry'    => __( 'Please refresh the page and try again.', 'idiomiq-adaptive-placement-test' ),
            'retry'            => __( 'Please try again.', 'idiomiq-adaptive-placement-test' ),
            'unknown_error'    => __( 'Unknown error occurred.', 'idiomiq-adaptive-placement-test' ),
            'retake_test'      => __( 'Retake Test', 'idiomiq-adaptive-placement-test' ),
            'loading'          => get_option( 'iiqapt_during_loading', __( 'Loading question...', 'idiomiq-adaptive-placement-test' ) ),
            'dyslexic_off'     => get_option( 'iiqapt_during_dyslexic_off', __( 'Change to dyslexia friendly font', 'idiomiq-adaptive-placement-test' ) ),
            'dyslexic_on'      => get_option( 'iiqapt_during_dyslexic_on',  __( 'Change to regular font', 'idiomiq-adaptive-placement-test' ) ),
        ],
    ];

    // Allow add-ons to inject additional script data via this filter.
    $data = apply_filters( 'iiqapt_script_data', $data );

    wp_localize_script( 'iiqapt-script', 'iiqapt_ajax', $data );
}
add_action( 'wp_enqueue_scripts', 'iiqapt_enqueue_scripts' );

function iiqapt_plugin_action_links( $links ) {
    $settings_link = '<a href="' . esc_url( admin_url( 'options-general.php?page=iiqapt' ) ) . '">' . esc_html__( 'Settings', 'idiomiq-adaptive-placement-test' ) . '</a>';
    array_unshift( $links, $settings_link );
    return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'iiqapt_plugin_action_links' );

// X-Frame-Options: SAMEORIGIN — clickjacking protection for the quiz.
// Disabled by default because it applies to every page on the site, not just
// pages that contain the shortcode. This can break legitimate iframes elsewhere
// (e.g. embedded video, third-party widgets). For clients who need this protection,
// un-comment the three lines below, or set the header at the server level (nginx/Apache)
// which is the more appropriate place for a site-wide policy.
//
// function iiqapt_security_headers( $headers ) {
//     $headers['X-Frame-Options'] = 'SAMEORIGIN';
//     return $headers;
// }
// add_filter( 'wp_headers', 'iiqapt_security_headers' );
