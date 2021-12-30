addXP();

async function addXP() {

  // setup: determine group of actors to be awarded experience
  if (game.user.targets.size < 1) {
    // (1) all player characters if no tokens are selected
    awardees = Array.from(game.actors).filter(pc => pc.hasPlayerOwner && pc.type == 'character');
  } else {
    // (2) otherwise, all targeted player character tokens
    awardees = Array.from(game.user.targets).filter(pc => pc.actor.hasPlayerOwner && pc.actor.type == 'character');
  }

  // setup: exit with notice if there are no player-owned characters
  if (awardees.length < 1) return ui.notifications.error(game.i18n.localize("GMTOOLKIT.Token.TargetPCs"), {});

  // Set default XP and reason
  let XP = Number(game.settings.get("wfrp4e-gm-toolkit", "addXPDefaultAmount"))
  let reason = (game.settings.get("wfrp4e-gm-toolkit", "addXPDefaultReason") == "null") ? "" : (game.settings.get("wfrp4e-gm-toolkit", "addXPDefaultReason")) 

  // Prompt for XP if option is set
  if (game.settings.get("wfrp4e-gm-toolkit", "addXPPrompt")) {
    let awardeeList = "<ul>"
    awardees.forEach (pc => {
      awardeeList +=  `<li>${pc?.actor?.name || pc.name}</li>` 
    })
    awardeeList += "</ul>"
    const dialog = new Dialog({
      title: (game.i18n.localize('GMTOOLKIT.Dialog.AddXP.Title')),
      content: `<form>
              <p>${game.i18n.format("GMTOOLKIT.Dialog.AddXP.Recipients", {recipients : awardeeList})}</p>
              <div class="form-group">
                <label>${game.i18n.localize("GMTOOLKIT.Dialog.AddXP.Prompt")}</label> 
                <input type="text" id="add-xp" name="add-xp" value="${XP}" />
              </div>
              <div class="form-group">
                <label>${game.i18n.localize("GMTOOLKIT.Dialog.AddXP.Reason")}</label> 
                <input type="text" id="xp-reason" name="xp-reason" value="${reason}" />
              </div>
          </form>`,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize("GMTOOLKIT.Dialog.Apply"),
          callback: (html) => {
            let XP = Math.round(html.find('#add-xp').val());
            if (isNaN(XP)) return ui.notifications.error(game.i18n.localize('GMTOOLKIT.Dialog.AddXP.InvalidXP'))
            let reason =  html.find('#xp-reason').val();
            updateXP(awardees, XP, reason);
          }
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize("GMTOOLKIT.Dialog.Cancel"),
        },
      },
      default: "yes"
  }).render(true);
  } else {
    updateXP(awardees, XP, reason)
  }

} // END: addXP

function updateXP(awardees, XP, reason) {
  let chatContent = ""

  // cycle through player characters, gathering experience change data for report message
  awardees.forEach ( pc  => {
    recipient = pc?.actor?.name || pc.name 
    XPTotal = pc?.details?.experience?.total || pc.actor.data.data.details.experience.total; 
    newXPTotal = Math.max(XPTotal + XP,0);
    XPCurrent = pc?.details?.experience?.current  || pc.actor.data.data.details.experience.current; 
    newXPCurrent = Math.max(XPCurrent + XP,0);

    // update token actor or actor
    pc?.actor ? pc.actor.awardExp(XP, reason) : pc.awardExp(XP, reason)

    // build report message 
    chatContent += game.i18n.format('GMTOOLKIT.AddXP.Success', {recipient, XPTotal, newXPTotal, XPCurrent, newXPCurrent} )  
  }); // end cycle
  
// confirm changes made in whisper to GM
    let chatData = game.wfrp4e.utility.chatDataSetup(chatContent, "gmroll", false)
    chatData.flavor = game.i18n.format("GMTOOLKIT.AddXP.Flavor", {XP, reason})
    ChatMessage.create(chatData, {});  
    console.log(chatContent)

} // END: updateXP


/* ==========
 * MACRO: Add XP
 * VERSION: 0.8.0
 * UPDATED: 2021-12-30
 * DESCRIPTION: Adds a set amount of XP to all or targeted player character(s). Adds XP update note to the Chat log.
 * TIP: Characters must have a player assigned. 
 * TIP: Default XP amount and reason can be preset in module settings, along with option to bypass prompt for XP amount each time.
 * TIP: Non-whole numbers are rounded off. Negative numbers are subtracted. 
 ========== */