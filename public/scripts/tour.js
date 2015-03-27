/*jshint camelcase: true, undef: false, unused: false, node: false, indent: 2*/
function range(start, finish) {
  var result = [];
  for (var i = start; i <= finish; i++) {
    result.push(i);
  }
  return result;
}

function tour($, hopscotch, steps) {
  $(function () {
    $(document).on('keypress', function (e) {
      switch (e.key) {
        case 'Left':
        case 'ArrowLeft': {
          hopscotch.prevStep();
          break;
        }
        case 'Right':
        case 'ArrowRight': {
          hopscotch.nextStep();
          break;
        }
      }
    });
    var endTour = function () {
      window.location = '/tour/ended';
    };
    var tourDef = {
      id: 'wt-tour',
      showPrevButton: true,
      skipIfNoElement: true,
      onClose: endTour,
      onEnd: endTour,
      steps: [
        {
          target: 'h1',
          placement: 'bottom',
          title: 'Dashboard',
          content: "Welcome to Writer's Trail! I'll guide you around the site. This is your dashboard.<br><br>" +
          "You may dismiss this tour and go to <a href=\"/settings\">your settings page</a> to reenable it."
        },
        {
          target: '#active-projects',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Active projects',
          content: "These are your active projects. Since you're new here, it might be a little empty. " +
          "So let me take you to an example dashboard. Click on 'Next' button to go there.",
          multipage: true,
          onNext: function () {
            window.location = '/example/dashboard';
          }
        },
        {
          target: 'h1',
          placement: 'right',
          xOffset: 'center',
          arrowOffset: 0,
          title: 'Sample dashboard',
          content: "That's a little better, right? Don't worry, I'm sure you'll soon have a dashboard like that.",
          onPrev: function () {
            window.location = '/dashboard';
          }
        },
        {
          target: '#active-projects',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Active projects',
          content: 'See? This is a sample list of projects. This only show your last five active projects (you choose which ones are active).' 
        },
        {
          target: '#active-projects li:nth-child(3) .progress',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Progress',
          content: 'There are progress bar for each project, according to the defined target and the current wordcount. You can see the wordcount by hovering your mouse cursor over the bars.'
        },
        {
          target: '#active-projects li:nth-child(4) .progress',
          placement: 'bottom',
          xOffset: 0,
          arrowOffset: 40,
          title: 'Progress',
          content: "A red bar means you are still at the beginning. Don't give up!"
        },
        {
          target: '#active-projects li:nth-child(3) .progress',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 70,
          title: 'Progress',
          content: "A yellow bar means you are getting there. You're making progress."
        },
        {
          target: '#active-projects li:nth-child(2) .progress',
          placement: 'bottom',
          xOffset: 400,
          arrowOffset: 100,
          title: 'Progress',
          content: "A green bar means you are almost at the end. Just a little further!"
        },
        {
          target: '#active-projects li:nth-child(1) .progress',
          placement: 'bottom',
          xOffset: 400,
          arrowOffset: 200,
          title: 'Progress',
          content: "A light blue bar means you're already got to the target. Well done!"
        },
        {
          target: '#chart',
          placement: 'right',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Nearest target',
          content: "This is the chart for the target that will finish first."
        },
        {
          target: '#latest-target button',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Display mode',
          content: "You can change the display mode to show the daily writing. Try the button now.",
          showNextButton: false,
          nextOnTargetClick: true
        },
        {
          target: '#chart',
          placement: 'right',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Display mode',
          content: "See how it changed? The default can be configured on your <a href='/settings'>settings page</a>."
        },
        {
          target: '#chart',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Extra data',
          content: "You may also click on the legend to show/hide data. These can be shown by default if you configure on your settings page."
        },
        {
          target: '#stats',
          placement: 'left',
          yOffset: 'center',
          arrowOffset: 'center',
          title: 'Stats',
          content: "These are your writing statistics. It shows habits like the period you are most productive on writing and the kind of session where you perform better. Those stats are more accurate the more sessions you make."
        },
        {
          target: '#see-projects',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Projects',
          content: "Alright, let's get started and make a new project. Click on the link to see your active projects page.",
          showNextButton: false,
          nextOnTargetClick: true,
          multipage: true,
          onNext: function () {
            window.location = '/projects/active';
          }
        },
        {
          target: '#active-projects',
          placement: 'bottom',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Active projects',
          content: "This are the same list of the dashboard, only it's not limited to just five projects."
        },
        {
          target: '.btn-group a:nth-child(2)',
          placement: 'right',
          yOffset: 'center',
          arrowOffset: 'center',
          title: 'New project',
          content: "Let's create a new project to start using Writer's Trail.",
          showNextButton: false,
          nextOnTargetClick: true,
          multipage: true
        },
        {
          target: 'h1',
          placement: 'bottom',
          xOffset: 0,
          title: 'New project',
          content: "This is the page to create a new project. It can be anything you like: a novel, a short story, an essay, a monograph or anything else you want to write."
        },
        {
          target: '#name',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Project name',
          content: "Set a nice and meaningful name to it. For usability reasons, you can't have more than one project with the same name.",
          showNextButton: false,
          ctaLabel: 'I wrote the name',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#wordcount',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Starting wordcount',
          content: "If you already wrote something on this project, set the wordcount here. Since we don't know <em>when</em> you wrote it, this does not count for targets nor sessions statistics. But it does show in the project progress bar.",
          showNextButton: false,
          ctaLabel: 'I put the wordcount',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#targetwc',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Project target',
          content: "This is how much you intend to write in this project. It has no relation to the target chart you" +
          " saw on the dashboard, this is only for the progress bars and is completely optional.",
          showNextButton: false,
          ctaLabel: 'I put the target',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#charcount',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Starting character count',
          content: "This is the same as the starting wordcount, only it's characters instead. This is optional.",
          showNextButton: false,
          ctaLabel: 'I put the character count',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#targetcc',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Project character target',
          content: "This is also a target, but for characters. It is optional, but the progress bar will always count" +
          " in words.",
          showNextButton: false,
          ctaLabel: 'I put the character target',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#description',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Project description',
          content: "Here's a text field for you to write a description of your project. You don't need to write anything here if you don't want to.",
          showNextButton: false,
          ctaLabel: 'I\'m done with the description',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: $('label').has('#active').get(0),
          placement: 'right',
          yOffset: 'center',
          arrowOffset: 'center',
          title: 'Active',
          content: "Whether or not this project is active. This define if this project will be shown in the list of active project and in the dashboard."
        },
        {
          target: $('label').has('#finished').get(0),
          placement: 'right',
          yOffset: 'center',
          arrowOffset: 'center',
          title: 'Finished',
          content: "Check if you finished the project. If the project is not finished nor active, it's considered \"abandoned\", though it doesn't have any effect right now."
        },
        {
          target: '#genres',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Genres',
          content: "Here you can set the genres this project belongs to. We give you a default set, but you can add more and remove those if you wish to do so."
        },
        {
          target: 'button[name="create"]',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Create',
          content: "Click the button to create the new project. If there are any errors, this page will show them.",
          multipage: true,
          showNextButton: false,
          nextOnTargetClick: true
        },
        {
          target: '.alert:first',
          placement: 'bottom',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Alerts',
          content: "This alert should show you that the the project was created. Keep on eye on these alerts as they may bring important information."
        },
        {
          target: '.list-group',
          placement: 'top',
          xOffset: 100,
          arrowOffset: 'center',
          title: 'New project',
          content: "Here you can see information about the project you just created."
        },
        {
          target: '#chart',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Progress',
          content: 'Here is a chart showing your daily progress, though it should now be empty.'
        },
        {
          target: '#select-range',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Range',
          content: 'And you can select the date range this chart shows. It defaults to the last 30 days.'
        },
        {
          target: '#create-target',
          placement: 'right',
          yOffset: 'center',
          arrowOffset: 'center',
          title: 'New target',
          content: "This is shortcut button to create a new target. Click on it.",
          showNextButton: false,
          multipage: true,
          nextOnTargetClick: true
        },
        {
          target: '#projects',
          placement: 'top',
          xOffset: 120,
          arrowOffset: 120,
          title: 'Selected projects',
          content: "Note that the project you just were is already selected. This is because of the shortcut button. You may select many projects for a single target."
        },
        {
          target: '#name',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Target name',
          content: "This is a name for reference. You can set many targets with the same name.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the name',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#count',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Target count',
          content: "How much you intend to have achieved by the end of the period. The unit (words or characters) can " +
          "be selected in the next field.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the target',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#unit',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Count unit',
          content: "What kind of unit you are tracking for this target. This reflects how the charts are shown.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the unit',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#start',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Start date',
          content: "When you will (or did) start this target's tracking. It's usually set to the next day, but I set " +
          "it to five days ago so you can have a feel of an ongoing target.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the start date',
          showCTAButton: true,
          onShow: function () {
            $('#start').val(moment().subtract(5, 'days').format(window.format));
          },
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#end',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'End date',
          content: "And here is when the target's period will end. Date and time formatting can be altered in your " +
          "<a href=\"/settings\">settings page</a>.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the end date',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#notes',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 0,
          title: 'Extra notes',
          content: "You can use this field to keep any notes for yourself about the target.",
          showNextButton: false,
          ctaLabel: 'I\'ve added the notes',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: 'button[name="create"]',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Create',
          content: "Click the button to create the new target. Again, if there are any errors, this page will show them.",
          multipage: true,
          showNextButton: false,
          nextOnTargetClick: true
        },
        {
          target: '.panel-title',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Target page',
          content: "This page shows statistics of your targets. It might not have much since you just created the target, but you might explore it later."
        },
        {
          target: '.btn-group a:nth-child(4)',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'New session',
          content: "This button with a plus and clock goes to the form that creates a new writing session. Use this to advance the progress of your projects and targets.",
          multipage: true,
          showNextButton: false,
          nextOnTargetClick: true
        },
        {
          target: '#summary',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Session summary',
          content: "This is an optional summary to help you find sessions.",
          showNextButton: false,
          ctaLabel: 'I\'ve filled the summary',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#project',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Project',
          content: "To which project this writing session was for.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the project',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#start',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Start time',
          content: "When you did start to write.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the time',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#duration',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Session duration',
          content: "How much time you spent writing. This can be left blank if you don't know",
          showNextButton: false,
          ctaLabel: 'I\'ve set the duration',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#pausedTime',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Time not writing',
          content: "How much time during the session you were not actually writing. This can't be set if there's no duration.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the time',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#wordcount',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Words written',
          content: "Here you put the amount of words you wrote in this session. It'll be tracked in the project and " +
          "targets in which this session apply.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the word count',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#charcount',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Characters typed',
          content: "The same as the previous field, but for characters. This is optional, but notice that some targets " +
          "may track the character count if you set them to do so.",
          showNextButton: false,
          ctaLabel: 'I\'ve set the character count',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#text',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Word counter',
          content: "If you prefer, you can paste the text you've written in here so the system can count the words " +
          "and characters. We will not save any of it, so be sure you back it up somewhere!",
          showNextButton: false,
          ctaLabel: 'I got it',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: '#isCountdown',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'left',
          title: 'Countdown session',
          content: "If you used a regressive timer, check this field. It helps to make your statistics later."
        },
        {
          target: '#notes',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Notes',
          content: "Here you can put any notes you want to keep about this session.",
          showNextButton: false,
          ctaLabel: 'Next',
          showCTAButton: true,
          onCTA: function () {
            hopscotch.nextStep();
          }
        },
        {
          target: 'button[name="create"]',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Create',
          content: "Click the button to create the new session.",
          multipage: true,
          showNextButton: false,
          nextOnTargetClick: true
        },
        {
          target: '.list-group',
          placement: 'top',
          xOffset: 0,
          arrowOffset: 'center',
          title: 'Session info',
          content: "Now you have created a new session. If it advanced any target, it'll be shown in this page and reflected in the chart. Also it generates stats about your writing habits in your dashboard."
        },
        {
          target: '#dashboard-navbar-link',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Dashboard',
          content: "Let's go back to the dashboard and see how it changed.",
          multipage: true,
          showNextButton: false,
          nextOnTargetClick: true
        },
        {
          target: '#active-projects',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Dashboard',
          content: "Much better, right?"
        },
        {
          target: $('#stats').find('a[href="/stats"]').last().get(0),
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Stats',
          content: "And now you should have some stats in here. Click on the link to see more.",
          multipage: true,
          showNextButton: false,
          nextOnTargetClick: true
        },
        {
          target: 'h1',
          placement: 'bottom',
          title: 'Statistics',
          content: "This is the page that sums up all statistics.",
          onPrev: function () {
            window.location = '/dashboard'
          }
        },
        {
          target: '#year',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Year summary',
          content: "This is a heatmap showing much you've written everyday in the last year. The greener the better!"
        },
        {
          target: '#tops',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'High score',
          content: "Just a sum of your best moments. Want to try to beat yourself?"
        },
        {
          target: '#avgs',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Averages and modes',
          content: "Not always you are in tiptop shape. Here you can see better your general habits."
        },
        {
          target: '#perfPeriod',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Performance per period',
          content: "Charts showing how you do for each period of the day."
        },
        {
          target: '#perfSession',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Performance per session',
          content: "The same thing as above, but this consider session duration instead of period."
        },
        {
          target: '#timer-navbar-link',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Timer',
          content: "Now, let's see this timer.",
          multipage: true,
          showNextButton: false,
          nextOnTargetClick: true
        },
        {
          target: '#timerclock',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Timer',
          content: "This is a basic timer. You can set the default time in your settings. When it finishes, it does a " +
          "beep sound and open a pre-filled form where you can create a writing session."
        },
        {
          target: '#chronoclock',
          placement: 'top',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Chronometer',
          content: "This is like the timer, but it rolls forward and only stops when you tell it to."
        },
        {
          target: '#timerpause',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Away button',
          content: "There's a button to click if you're away but still didn't finish your session. This goes to the " +
          "\"Time not writing\" field."
        },
        {
          target: '#feedback',
          placement: 'right',
          yOffset: 'center',
          arrowOffset: 'center',
          fixedElement: true,
          title: "Feedback",
          content: "If you found a bug/error/misspelling or has any important comments and suggestions, click this button here and inform us. You can see the list of requests in the <a href='/feedback'>feedback</a> page."
        },
        {
          target: '.navbar-brand',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: "Writer's Trail",
          content: "That's pretty much everything for now. We hope you like it. And we also intend to add features, so keep lurking around!<br><br>Ever need to see this tour again? Select in your <a href='/settings'>settings</a>!",
          showNextButton: true
        }
      ]
    };
    if (!steps) { return false; }

    for (var i = 0; i < steps.length; i++) {
      var state = hopscotch.getState(),
        pieces = state ? state.split(':') : [0, 0];
      if ((hopscotch.getState() === null && steps[i] === 0) || (pieces[0] === "wt-tour" && pieces[1] === steps[i].toString())) {
        hopscotch.startTour(tourDef);
        return true;
      }
    }
    return false;
  });
}