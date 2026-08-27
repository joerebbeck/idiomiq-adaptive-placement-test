=== IdiomIQ Adaptive Placement Test ===
Contributors: joerebbeck
Tags: cefr, placement test, english test, lead generation, esl
Requires at least: 6.0
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.3.5
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Built for language schools, English tutors, and course providers, the Adaptive Placement Test turns website visitors into pre-qualified leads.

== Description ==

Students take a short, adaptive CEFR test on your page, and you receive their email address together with an accurate A2–C2 level — notified by email and logged in your WordPress dashboard. Give visitors something genuinely useful, an instant read on their language level, and get something valuable back: a lead you can actually act on, with no wasted discovery calls.

**How it works**

1. **Add it to any page.** Paste the shortcode wherever you want the test. Works with any theme — no code or developer required.
2. **Visitors take the test.** The adaptive algorithm adjusts difficulty in real time. No account, no app, no download.
3. **You receive a qualified lead.** You capture their email the moment they start, and their CEFR level the moment they finish.

**Why adaptive?**

Instead of asking everyone the same fixed list, the test targets each student's ability and reaches an accurate CEFR estimate in far fewer questions. Under the hood it uses a Bayesian EAP estimator with an Item Response Theory (3PL) model — the approach behind professional adaptive exams — but your visitors just see a fast, fair test.

**Key features**

* Pre-built adaptive CEFR test with 150 professionally curated English questions
* GDPR-friendly email lead capture, with an optional marketing opt-in
* Customisable student results email and new-lead alert emails
* Sub-level classification (e.g. "Strong B2") for extra nuance
* Unlimited question banks and questions — bulk import and export via CSV
* Attempt logs with search, sort, and CSV export
* Configurable data retention with automatic daily cleanup
* Match your brand colour and edit every word of the on-screen wording
* Dyslexia-friendly font toggle (OpenDyslexic)
* Rate limiting and honeypot bot defence
* Control test length and target confidence
* Embed on any page or post with a shortcode

**Your site. Your brand. Your data.**

Everything runs on your own WordPress install. Student data is stored in your database and is never sent to a third party.

**Shortcode**

Place the test on any page or post:

`[iiqapt]`

To use a specific question bank:

`[iiqapt bank="2"]`

**Go further with Pro**

The optional [IdiomIQ Adaptive Placement Test Pro](https://idiomiq.com/iiqapt/) add-on extends the free plugin with printable student reports, deeper visual customisation, an encouragement overlay, and social sharing, plus 12 months of support and updates.

**Source code**

Development takes place on [GitHub](https://github.com/joerebbeck/idiomiq-adaptive-placement-test).

== Installation ==

1. Upload the `idiomiq-adaptive-placement-test` folder to `/wp-content/plugins/`, or install directly from the WordPress plugin directory.
2. Activate the plugin through the **Plugins** menu.
3. Go to **Settings → IdiomIQ Adaptive Placement Test** to configure question banks, email templates, and quiz behaviour.
4. Add `[iiqapt]` to any page or post where you want the test to appear.
5. Import questions via **Questions → Import CSV**, or add them individually through the admin interface.

== Frequently Asked Questions ==

= Do students need an account or an app? =

No. Visitors take the test right on your page — no login, no downloads. They enter an email address to receive their results, and that's all.

= How do I add the test to a page? =

Paste the `[iiqapt]` shortcode into any page or post. To use a specific question bank, add its ID: `[iiqapt bank="2"]`. It works with any theme.

= What information do I collect from each student? =

Their email address (entered before the test begins) and their result — CEFR level, ability estimate, and test duration — stored in your site's own database. See the Privacy Policy section below for full detail.

= Is it GDPR friendly? =

Yes, it is built with GDPR in mind. The email field includes a consent checkbox, you can add an optional follow-up marketing opt-in, IP addresses are only stored temporarily as a one-way hash for abuse prevention, and you control how long results are kept. You remain the data controller and should reference this data collection in your own privacy policy.

= How accurate is the result, and how does "adaptive" work? =

After each batch of answers the plugin re-estimates the student's ability using a Bayesian EAP / IRT (3PL) model and selects the next questions accordingly. The test stops once it reaches your target confidence or the maximum number of question batches, producing an accurate CEFR level (A2–C2) — often in fewer questions than a fixed-length test. Sub-levels such as "Strong B2" add extra nuance.

= What is CEFR? =

The Common European Framework of Reference for Languages (CEFR) is an international standard for describing language ability. This plugin assesses levels A2 (Elementary) through C2 (Mastery).

= Can I use my own questions? =

Yes. Add questions in the admin, or bulk-import them from a CSV file. You can create multiple question banks and target each one with the `bank` shortcode attribute. For import, provide the question stem, four answer options, the correct answer (A–D), and the CEFR level (A2, B1, B2, C1, or C2).

= Can I match my brand and change the wording? =

Yes. Set a primary colour and edit every on-screen string — start screen, buttons, loading and results text — as well as the student and admin email templates, all from the settings screen.

= What is the difference between Free and Pro? =

The free plugin is fully functional: unlimited question banks and questions, lead-capture emails, attempt logs, CSV import and export, and full customisation of wording and colour. The optional Pro add-on adds printable student reports, deeper visual customisation, an encouragement overlay, and social sharing, with 12 months of support and updates. Details at https://idiomiq.com/iiqapt/.

== Privacy Policy ==

This plugin collects and stores personal data as described below. All data is held in your site's own database. The free plugin does not transmit personal data to any third party.

**Data collected per test attempt**

* Student email address — entered voluntarily before the test begins; used to deliver results by email and stored in the attempt log.
* Test outcome: CEFR level, ability estimate (theta), standard error, and test duration — stored alongside the email to allow administrators to review attempt history.
* Date and time of the attempt.

**Storage location:** The `{prefix}iiqapt_attempt_logs` database table on your own server.

**Retention period:** Configurable under **Settings → IdiomIQ Adaptive Placement Test → General Settings → Log Retention**. The default is 90 days; a daily scheduled event automatically removes records older than this threshold. Administrators can also delete individual records or the entire log from the Attempt Logs admin tab.

**Data deletion on uninstall:** If **Delete data on uninstall** is enabled in General Settings, all plugin database tables and stored options are permanently removed when the plugin is uninstalled via the WordPress admin.

**Rate limiting**

To prevent automated abuse, a hashed representation of the visitor's IP address (MD5 hash — the raw address is not stored) is written to a WordPress transient at the start and submission of each test attempt. These transients expire automatically after one hour and are not retained as long-term records.

**Recommended site owner disclosure**

Site owners should include the following information in their own Privacy Policy:

*"When you take the English level test, we collect your email address and store your result (CEFR level and score) in our database. This information is used to send you your results and to allow our team to review outcomes. Records are automatically deleted after [your configured retention period] days. Your IP address is temporarily hashed and stored for up to one hour for abuse-prevention purposes only."*

== Screenshots ==

1. The start screen visitors see on your page — they enter an email address and opt in before beginning the test.
2. An adaptive question during the test, with a progress bar and a dyslexia-friendly font toggle.
3. The results screen — the estimated CEFR level shown on an A2–C2 scale with margin of error, and emailed to the student.
4. Attempt Logs — every captured lead with email, result, confidence and time taken; searchable, sortable and exportable to CSV.
5. Quiz Settings, Before the Quiz — customise the start screen title, wording, email prompt and consent, with a live preview.
6. Quiz Settings, During the Quiz — loading and analysing text, progress bar, question counter, alignment and the dyslexia-friendly font toggle.
7. Quiz Settings, After the Quiz — customise the results screen and margin-of-error label, with a live preview.
8. Messages — customise the student results email and the new-lead admin notification, including placeholders.
9. Questions — manage question banks, add or edit questions, and bulk import or export via CSV.
10. General Settings — test length, target confidence, sub-level labels, brand colour, log retention and rate limiting.

== Changelog ==

= 1.3.5 =
* Fixed the settings live preview so HTML in the start-screen title, subtitle, body and follow-up consent message now renders correctly instead of showing the raw tags.
* Refreshed the plugin description and readme.

= 1.3.4 =
* Fixed a MySQL syntax error logged on activation — the questions index is now declared in the table schema (dbDelta) instead of an unsupported `CREATE INDEX IF NOT EXISTS` statement.

= 1.3.3 =
* Security: added explicit capability and nonce verification to the settings save-tracking notice before any state is written.
* Fixed the Plugin URI to point to the live plugin page.

= 1.3.2 =
* Standardised all internal code naming to a single `iiqapt` prefix (functions, options, database tables, CSS/JS, hooks).
* The shortcode is now `[iiqapt]` (previously `[adaptive_level_test]`).
* Reordered the settings tabs — Attempt Logs first, General Settings last.
* Adaptive algorithm: a top-level (C2) student now continues until the confidence target or batch limit, symmetric with the A2 floor.

= 1.3.1 =
* Renamed plugin to IdiomIQ Adaptive Placement Test.
* Removed question bank and question count limits — the free plugin is now fully unlimited.
* Converted all inline script and style tags to use the WordPress enqueue API.
* Extracted admin JavaScript to external files for better caching and CSP compatibility.

= 1.3.0 =
* Initial public release as a standalone free plugin.
* Core adaptive quiz with Bayesian EAP / IRT 3PL algorithm.
* Unlimited question banks and questions per bank.
* CSV import for bulk question upload.
* Student and admin result notification emails.
* Attempt log with search, sort, per-column filtering, and CSV export.
* Dyslexia-friendly OpenDyslexic font toggle.
* GDPR follow-up consent checkbox and honeypot spam protection.
* Rate limiting via hashed IP transients (1-hour TTL).
* Configurable log retention with daily scheduled cleanup.
* Option to delete all plugin data on uninstall.

== Upgrade Notice ==

= 1.3.5 =
Fixes HTML rendering in the settings live preview and refreshes the plugin description.

= 1.3.4 =
Fixes a database error logged on activation. No action required.

= 1.3.3 =
Security hardening for the settings save-tracking notice and a corrected Plugin URI.

= 1.3.2 =
Internal naming standardised. The shortcode is now `[iiqapt]` — update any pages that used the old `[adaptive_level_test]` shortcode.

= 1.3.1 =
Renamed to IdiomIQ Adaptive Placement Test. Question bank and question count limits removed — the free plugin is now fully unlimited.

= 1.3.0 =
Initial release.
