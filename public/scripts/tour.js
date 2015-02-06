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
          content: "Welcome to Writer's Trail! I'll guide you around the site. This is your dashboard.<br><br>You may dismiss this tour and go to your setting to reenable it."
        },
        {
          target: '#active-projects',
          placement: 'bottom',
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Active projects',
          content: "These are your active projects. Since you're new here, it might be a little empty. So let me take you to an example dashboard. Click on 'Next' button to go there.",
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
          content: "You may also click on the legend to show/hide data. These can be shown by default if you configure like it on your settings page."
        },
        {
          target: '#stats',
          placement: 'left',
          yOffset: 'center',
          arrowOffset: 'center',
          title: 'Stats',
          content: "These are your writing statistics. It show habits like the period are most productive on writing and the kind of session you perform better. Those stats are more accurate the more sessions you make."
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
          content: "This is how much you intend to write in this project. It has no relation to the target chart you saw on the dashboard, this is only for the progress bars.",
          showNextButton: false,
          ctaLabel: 'I put the target',
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
          title: 'Target form',
          content: "This is the form to create a new target. It should be easy to understand what is every field for.",
          showNextButton: false,
          ctaLabel: 'I\'ve filled the form',
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
          xOffset: 'center',
          arrowOffset: 'center',
          title: 'Session form',
          content: "Here is the form to input a new writing session. From now on, start timing your work sessions and take note so you put them here.",
          showNextButton: false,
          ctaLabel: 'I\'ve filled the form',
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
          xOffset: 'center',
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

    console.log(hopscotch.getState());

    if (!steps) { return false; }

    for (var i = 0; i < steps.length; i++) {
      console.log(steps[i]);
      if ((hopscotch.getState() === null && steps[i] === 0) || hopscotch.getState() === "wt-tour:" + steps[i]) {
        hopscotch.startTour(tourDef);
        return true;
      }
    }
    return false;
  });
}