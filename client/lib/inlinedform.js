// A inlined form is used to provide a quick edition of single field for a given
// document. Clicking on a edit button should display the form to edit the field
// value. The form can then be submited, or just closed.
//
// When the form is closed we save non-submitted values in memory to avoid any
// data loss.
//
// Usage:
//
//   +inlineForm
//     // the content when the form is open
//   else
//     // the content when the form is close (optional)

// We can only have one inlined form element opened at a time
currentlyOpenedForm = new ReactiveVar(null);

InlinedForm = BlazeComponent.extendComponent({
  template: function() {
    return 'inlinedForm';
  },

  onCreated: function() {
    this.isOpen = new ReactiveVar(false);
  },

  onDestroyed: function() {
    currentlyOpenedForm.set(null);
  },

  open: function() {
    // Close currently opened form, if any
    EscapeActions.executeUpTo('inlinedForm');
    this.isOpen.set(true);
    currentlyOpenedForm.set(this);
  },

  close: function() {
    this.isOpen.set(false);
    currentlyOpenedForm.set(null);
  },

  getValue: function() {
    var input = this.find('textarea,input[type=text]');
    return this.isOpen.get() && input && input.value;
  },

  events: function() {
    return [{
      'click .js-close-inlined-form': this.close,
      'click .js-open-inlined-form': this.open,

      // Pressing Ctrl+Enter should submit the form
      'keydown form textarea': function(evt) {
        if (evt.keyCode === 13 && (evt.metaKey || evt.ctrlKey)) {
          this.find('button[type=submit]').click();
        }
      },

      // Close the inlined form when after its submission
      submit: function() {
        if (this.currentData().autoclose !== false) {
          Tracker.afterFlush(() => {
            this.close();
          });
        }
      }
    }];
  }
}).register('inlinedForm');

// Press escape to close the currently opened inlinedForm
EscapeActions.register('inlinedForm',
  function() { currentlyOpenedForm.get().close(); },
  function() { return currentlyOpenedForm.get() !== null; }, {
    noClickEscapeOn: '.js-inlined-form'
  }
);
