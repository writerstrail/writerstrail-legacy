function tour(hopscotch) {
  var tourDef = {
    id: 'wt-tour',
    steps: [
      {
        target: 'h1',
        placement: 'bottom',
        title: 'Dashboard',
        content: "Welcome to Writer's Trail! This is your dashboard."
      }
    ]
  };
  
  if (hopscotch.getState() && hopscotch.getState().indexOf("wt-tour") !== false) {
    hopscotch.startTour(tourDef);
    return false;
  }
  
  return tourDef;
}