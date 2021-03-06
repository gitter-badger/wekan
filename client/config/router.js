let previousPath;
FlowRouter.triggers.exit([({path}) => {
  previousPath = path;
}]);

FlowRouter.route('/', {
  name: 'home',
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  action: function() {
    Session.set('currentBoard', null);
    Session.set('currentCard', null);

    Filter.reset();
    EscapeActions.executeAll();

    BlazeLayout.render('defaultLayout', { content: 'boardList' });
  }
});

FlowRouter.route('/b/:id/:slug', {
  name: 'board',
  action: function(params) {
    let currentBoard = params.id;
    let previousBoard = Session.get('currentBoard');
    Session.set('currentBoard', currentBoard);
    Session.set('currentCard', null);

    // If we close a card, we'll execute again this route action but we don't
    // want to excape every current actions (filters, etc.)
    if (previousBoard !== currentBoard) {
      EscapeActions.executeAll();
    }

    BlazeLayout.render('defaultLayout', { content: 'board' });
  }
});

FlowRouter.route('/b/:boardId/:slug/:cardId', {
  name: 'card',
  action: function(params) {
    Session.set('currentBoard', params.boardId);
    Session.set('currentCard', params.cardId);

    EscapeActions.executeUpTo('inlinedForm');

    BlazeLayout.render('defaultLayout', { content: 'board' });
  }
});

FlowRouter.route('/shortcuts', {
  name: 'shortcuts',
  action: function(params) {
    const shortcutsTemplate = 'keyboardShortcuts';

    EscapeActions.executeUpTo('popup-close');

    if (previousPath) {
      Modal.open(shortcutsTemplate, {
        onCloseGoTo: previousPath
      });
    } else {
      // XXX There is currently no way to escape this page on Sandstorm
      BlazeLayout.render('defaultLayout', { content: shortcutsTemplate });
    }
  }
});

FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render('defaultLayout', { content: 'notFound' });
  }
}

// We maintain a list of redirections to ensure that we don't break old URLs
// when we change our routing scheme.
var redirections = {
  '/boards': '/',
  '/boards/:id/:slug': '/b/:id/:slug',
  '/boards/:id/:slug/:cardId': '/b/:id/:slug/:cardId'
};

_.each(redirections, function(newPath, oldPath) {
  FlowRouter.route(oldPath, {
    triggersEnter: [function(context, redirect) {
      redirect(FlowRouter.path(newPath, context.params));
    }]
  });
});
