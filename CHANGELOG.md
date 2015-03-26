# Writer's Trail change log

## v0.6.1

* Fix a bug that didn't allow sessions with null duration.
* Fix a bug that didn't allow saving sessions with no summary.
* Fix Google Analytics script position.

## v0.6.0

* Added tests for models and changed them to be more accurate.
* Added statistics page with lots of information:
  * Year summary of each day.
  * Tops, averages and modes in some of the informations.
  * Charts about periods and sessions preferences.
* Fixed some grammatical mistakes.
* Changed default items per page from 10 to 30 (and max from 50 to 100).
* Changed some things in home page and features page to reflect the additions.
* Changed layout to break into rows on small screens.

## v0.5.1

* Fix formatting in highest wpm stat in dashboard.

## v0.5.0

* Fix Facebook language in home page.
* Remove checkboxes from sessions/targets in favor of blank textboxes.
* Show highest wpm in dashboard stats.
* Show a message if the user tries to leave page while running a timer.
* Add a text area for sessions so the system can count it.

## v0.4.1

* Fix a bug where dashboard did not render if there were no sessions.

## v0.4.0

* Mandatory password for those who login with social network.
* Allow sessions without duration.
* Showing feedback in progress by default.
* Tooltips on toolbars.

## v0.3.0

* Added option to create a target without a wordcount.
* Added chart to project page.
* Show alert if the user didn't write today.
* New page with timer and chronometer that fills session form.
* Now performance can be measured by real time or session time (user's choice).
* Fixed and issue with nearest target and timezone.
* Fixed some minor design issues.

## v0.2.5

* Fixed error with password hashing upon sign up.
* Locking up node modules versions.

## v0.2.4

* Fixed bug where updating sessions did not reflected into project wordcount.
* Change the list of sessions to prioritize summary.
* Fixed some language errors in the tour.

## v0.2.3

* Amending error in Facebook meta tags.

## v0.2.2

* Fixing Facebook and Open Graph tags.

## v0.2.1

* Fixing a bug that not allowed unlogged users to view single feedback.
* Showing only new feedback by default.

## v0.2.0

* Added help blocks to fields in all forms.
* Added maintenance mode to warn users.
* Fixed some misspellings.
* Added "Done" button to last step of tour.
* Changed color of full progress bars.
* Added help page.
* Minor fixes.

## v0.1.2

* Fixed issues with feedback description.
* Fixed bug where users who login with email don't have the last login date updated.

## v0.1.1

* Fixing problem with deploy migration.

## v0.1.0

* Starting version.
* Basic projects and targets.
* Simple productivity statistics.
* Custom genres.
* Based on writing sessions.