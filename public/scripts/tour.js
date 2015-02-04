function range(start, finish) {
  var result = [];
  for (var i = start; i <= finish; i++) {
    result.push(i);
  }
  return result;
}

function tour(hopscotch, steps) {
  var tourDef = {
    id: 'wt-tour',
    showPrevButton: true,
    steps: [
      {
        target: 'h1',
        placement: 'bottom',
        title: 'Dashboard',
        content: "Welcome to Writer's Trail! I'll guide you around the site. This is your dashboard."
      },
      {
        target: '#active-projects',
        placement: 'bottom',
        xOffset: 'center',
        arrowOffset: 'center',
        title: 'Active projects',
        content: "These are your active projects. Since you're new here, it migth be a little empty. So let me take you to an example dashboard. Click on 'Next' button to go there.",
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
        target: '#active-projects li:nth-child(1) .progress',
        placement: 'bottom',
        xOffset: 'center',
        arrowOffset: 'center',
        title: 'Progress',
        content: 'There are progress bar for each project, according to the defined target and the current wordcount. You can see the wordcount by hovering your mouse cursor over the bars.'
      },
      {
        target: '#active-projects li:nth-child(3) .progress',
        placement: 'bottom',
        xOffset: 0,
        arrowOffset: 0,
        title: 'Progress',
        content: "A red bar means you are still at the beginning. Don't give up!"
      },
      {
        target: '#active-projects li:nth-child(2) .progress',
        placement: 'bottom',
        xOffset: 'center',
        arrowOffset: 70,
        title: 'Progress',
        content: "A yellow bar means you are getting there. You're making progress."
      },
      {
        target: '#active-projects li:nth-child(1) .progress',
        placement: 'bottom',
        xOffset: 400,
        arrowOffset: 100,
        title: 'Progress',
        content: "A green bar means you are almost at the end or already finished. Try and get there."
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
}