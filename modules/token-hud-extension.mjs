import GMToolkit from "./gm-toolkit.mjs";
import GMToolkitSettings from "./gm-toolkit-settings.mjs";
import { hasSkill, adjustStatus } from "./utility.mjs";

export default class TokenHudExtension {

    static async addTokenHudExtensions(app, html, data) {
        // let actor = canvas.tokens.get(data.id).actor;
        let actor = game.actors.get(canvas.tokens.controlled[0].actor.id)
        if (actor === undefined) return;    

        const wfrp4eContent = {} 
        wfrp4eContent.core = game.modules.get("wfrp4e-core")?.active || false;
        GMToolkit.log(false, wfrp4eContent.core)

        this.addMovementTokenTip(app, html, data, actor)
        this.addPlayerCharacterTokenTip(app, html, data, actor, wfrp4eContent)
        this.addInitiativeTokenTip(app, html, data, actor)
    }

    static async addMovementTokenTip(app, html, data, actor) {
   
        const actorData = actor.data;
        const actorMoveDetails = actorData.data.details.move;

        let move = actorMoveDetails.value;      
        let TooltipMovement = `${game.i18n.localize("Move")}: ${move}`
        let displayedMovement = move
        let movementIcon = "fa-dharmachakra"
        if (actor.type != "vehicle") {
            let walk = actorMoveDetails.walk;
            let run = actorMoveDetails.run;
            let swim = actorMoveDetails.value / 2;
            movementIcon = "fa-shoe-prints"
            TooltipMovement += `; ${game.i18n.localize("Walk")}: ${walk}; ${game.i18n.localize("Run")}: ${run}; ${game.i18n.localize("Swim")}: ${swim}`;
            displayedMovement = run
        }
        let hudMovement = $(`<div class="control-icon tokenhudicon left" title="${TooltipMovement}"><i class="fas ${movementIcon}"></i> ${displayedMovement}</div>`);
        
        // Create space for Hud Extensions next to elevation icon
        let divTokenHudExt = '<div class="tokenhudext left">';
        html.find(".attribute.elevation").wrap(divTokenHudExt);
        html.find(".attribute.elevation").before(hudMovement);// Add Movement token tip
        
        // Add interactions for Movement
        hudMovement.find("i").dblclick(async (ev) => {
            if (actor.type == "vehicle") return;
            GMToolkit.log(false, `Movement hud extension double-clicked.`)
            if (ev.altKey && ev.shiftKey && ev.ctrlKey) {
                let skill = (hasSkill(actor,"Swim"))
                if (skill != null) {
                    actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
            }
            if (ev.ctrlKey && ev.altKey) {
                let skill = (hasSkill(actor,"Climb"))
                if (skill != null) {
                    actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                }
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }
            if (ev.ctrlKey && ev.shiftKey) {
                let skill = (hasSkill(actor,"Drive"))
                if (skill != null) {
                    actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                }
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }
            if (ev.altKey && ev.shiftKey) {
                // TODO: Interrogate actor Ride specializations and offer selection if more than one is available
                let skill = (hasSkill(actor,"Ride"))
                if (skill != null) {
                    actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                }
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }
            if (ev.ctrlKey) {
                let skill = (hasSkill(actor,"Dodge"))
                if (skill != null) {
                    actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                }
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }
            if (ev.altKey) {
                let skill = (hasSkill(actor,"Athletics"))
                if (skill != null) {
                    actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                }
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }
            if (ev.shiftKey) {
                // TODO: Interrogate actor Stealth specializations and offer selection if more than one is available
                let skill = (hasSkill(actor,"Stealth"))
                if (skill != null) {
                    actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                } 
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }
            GMToolkit.log(false, `Movement Button Clicked`)
        }) 

    }
    
    static async addInitiativeTokenTip(app, html, data, actor) {
        
       // Do not show initiative token tip if vehicle
       if (actor.type == "vehicle") return;

       const actorCharacteristics = actor.data.data.characteristics;

       let initiative = actorCharacteristics.i.value;
       let agility = actorCharacteristics.ag.value;

       let TooltipInitiative = `${game.i18n.localize("CHAR.I")}: ${initiative}; ${game.i18n.localize("CHAR.Ag")}: ${agility}`

       // Create space for Hud Extensions next to combat icon
       let hudDataCombat =  '[data-action="combat"]' 
       let divTokenHudExt = '<div class="tokenhudext right">';
       html.find(`.control-icon${hudDataCombat}`).wrap(divTokenHudExt);
       
       let hudInitiative = $(`<div class="control-icon tokenhudicon right" title="${TooltipInitiative}"><i class="fas fa-spinner"></i> ${initiative}</div>`);
       html.find(`.control-icon${hudDataCombat}`).after(hudInitiative); // Add Initiative and Agility token tip

       // Add interactions for Initiative and Agility
        hudInitiative.find("i").dblclick(async (ev) => {
            GMToolkit.log(false, `Initiative hud extension double-clicked.`)
            if (ev.ctrlKey && ev.shiftKey) {
                let skill = (hasSkill(actor,"Track"))
                if (skill != null) {
                    actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                }
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }
            if (ev.ctrlKey) {
                actor.setupCharacteristic("i").then(setupData => {actor.basicTest(setupData)});
                ev.preventDefault();
                ev.stopPropagation();
            }
            if (ev.altKey) {
                actor.setupCharacteristic("ag").then(setupData => {actor.basicTest(setupData)});
                ev.preventDefault();
                ev.stopPropagation();
            } 
        })

   }

    static async addPlayerCharacterTokenTip(app, html, data, actor, wfrp4eContent) {
        
        if (actor.data.type === "character") {
            
            // Set variables
            const actorData = actor.data;
            const actorStatus = actorData.data.status;
            const actorCharacteristics = actor.data.data.characteristics;
        
            let fortune = actorStatus.fortune.value 
            let fate = actorStatus.fate.value
            let resolve = actorStatus.resolve.value 
            let resilience = actorStatus.resilience.value
            let corruption = actorStatus.corruption.value
            let maxCorruption = actorStatus.corruption.max 
            let sin = actorStatus.sin.value
            let perception = actor.items.find(i => i.data.name === game.i18n.localize("Perception")  ).data.data.advances.value + actorCharacteristics.i.value
            let intuition = actor.items.find(i => i.data.name === game.i18n.localize("Intuition") ).data.data.advances.value + actorCharacteristics.i.value

            let TooltipFortune = `${game.i18n.localize("Fortune")}: ${fortune}; ${game.i18n.localize("Fate")}: ${fate}`
            let TooltipResolve = `${game.i18n.localize("Resolve")}: ${resolve}; ${game.i18n.localize("Resilience")}: ${resilience}`
            let TooltipCorruption = `${game.i18n.localize("Corruption")}: ${corruption} / ${maxCorruption}; ${game.i18n.localize("Sin")}: ${sin}`
            let TooltipPerception = `${game.i18n.localize("Perception")}: ${perception}; ${game.i18n.localize("Intuition")}: ${intuition}`

            let divTokenHudExt = '<div class="tokenhudext left">';
            
            // Create space for Hud Extensions next to config icon
            // Resolve, Resilience, Fortune, Fate
            let hudDataConfig =  '[data-action="config"]' 
            html.find(`.control-icon${hudDataConfig}`).wrap(divTokenHudExt);

            // Resolve and Resilience
            let hudResolve = $(`<div class="control-icon tokenhudicon left" title="${TooltipResolve}"><i class="fas fa-hand-rock">&nbsp;${resolve}</i></div>`);
            html.find(`.control-icon${hudDataConfig}`).before(hudResolve); // Add Resolve token tip

            // Add interactions for Resolve and Resilience
            hudResolve.find("i").contextmenu(async (ev) => {
                GMToolkit.log(false, `Resolve hud extension right-clicked.`)
                if (ev.ctrlKey) {
                    let result = await adjustStatus(actor, "Resolve", -1);
                    GMToolkit.log(false, result) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.shiftKey) {
                    let result = await adjustStatus(actor, "Resolve", 1);
                    GMToolkit.log(false, result) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
            })
            hudResolve.find("i").dblclick(async (ev) => {
                GMToolkit.log(false, `Resolve hud extension double-clicked.`)
                if (ev.ctrlKey) {
                    let skill = (hasSkill(actor,"Cool"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.altKey) {
                    let skill = (hasSkill(actor,"Endurance"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.shiftKey) {
                    let skill = (hasSkill(actor,"Consume Alcohol"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
            })  

            // Fortune and Fate
            let hudFortune = $(`<div class="control-icon tokenhudicon left" title="${TooltipFortune}"><i class="fas fa-dice">&nbsp;${fortune}</i></div>`);
            html.find(`.control-icon${hudDataConfig}`).before(hudFortune); // Add Fortune token tip
            // Add interactions for Fortune and Fate
            hudFortune.find("i").contextmenu(async (ev) => {
                GMToolkit.log(false, `Fortune hud extension right-clicked.`)
                if (ev.ctrlKey) {
                    let result = await adjustStatus(actor, "Fortune", -1);
                    GMToolkit.log(false, result) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.shiftKey) {
                    let result = await adjustStatus(actor, "Fortune", 1);
                    GMToolkit.log(false, result) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
            })
            hudFortune.find("i").dblclick(async (ev) => {
                GMToolkit.log(false, `Fortune hud extension double-clicked.`)
                if (ev.shiftKey && ev.altKey) {
                    let skill = (hasSkill(actor,"Charm Animal"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.ctrlKey) {
                    let skill = (hasSkill(actor,"Gamble"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.shiftKey) {
                    let skill = (hasSkill(actor,"Charm"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.altKey) {
                    let skill = (hasSkill(actor,"Gossip"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
            })


            // Create space for Hud Extensions next to target icon
            // Corruption, Sin, Perception, Intuition
            let hudDataTarget =  '[data-action="target"]' 
            html.find(`.control-icon${hudDataTarget}`).wrap(divTokenHudExt);

            // Corruption and Sin
            let hudCorruption = $(`<div class="control-icon tokenhudicon left" title="${TooltipCorruption}"><i class="fas fa-bahai">&nbsp;${corruption}</i></div>`);
            html.find(`.control-icon${hudDataTarget}`).before(hudCorruption); // Add Corruption token tip        

            // Add interactions for Corruption and Sin           
            hudCorruption.find("i").contextmenu(async (ev) => {
                GMToolkit.log(false,`Corruption hud extension right-clicked.`)
                if (ev.ctrlKey && ev.altKey) {
                    let result = await adjustStatus(actor, "Sin", -1);
                    GMToolkit.log(false, result) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.shiftKey && ev.altKey) {
                    let result = await adjustStatus(actor, "Sin", 1);
                    GMToolkit.log(false, result) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.ctrlKey) {
                    let result = await adjustStatus(actor, "Corruption", -1);
                    GMToolkit.log(false, result) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.shiftKey) {
                    let result = await adjustStatus(actor, "Corruption", 1);
                    GMToolkit.log(false, result) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
            })            
            hudCorruption.find("i").dblclick(async (ev) => {
                GMToolkit.log(false, `Corruption hud extension double-clicked.`)
                if (ev.ctrlKey && ev.shiftKey && wfrp4eContent.core) {
                    let result = game.wfrp4e.tables.formatChatRoll("mutatemental");
                    ChatMessage.create(game.wfrp4e.utility.chatDataSetup(result, "roll", true));
                    GMToolkit.log(false, `${actor.name} spawned a mental mutation.`) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.ctrlKey && ev.altKey) {
                    let littlePrayer = new Roll("d100") 
                    littlePrayer.roll();
                    let result = game.i18n.format("GMTOOLKIT.TokenHudExtension.LittlePrayerResult",{actorName: actor.name, littlePrayerResult: littlePrayer.result});
                    ChatMessage.create(game.wfrp4e.utility.chatDataSetup(result, "gmroll", true));
                    GMToolkit.log(false, result) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.shiftKey && ev.altKey && wfrp4eContent.core) {
                    let result = game.wfrp4e.tables.formatChatRoll("wrath");
                    ChatMessage.create(game.wfrp4e.utility.chatDataSetup(result, "roll", true));
                    GMToolkit.log(false, `${actor.name} incurred the Wrath of the Gods.`) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.ctrlKey && wfrp4eContent.core) {
                    let result = game.wfrp4e.tables.formatChatRoll("mutatephys");
                    ChatMessage.create(game.wfrp4e.utility.chatDataSetup(result, "roll", true));
                    GMToolkit.log(false, `${actor.name} spawned a physical mutation.`) 
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.altKey) {
                    let skill = (hasSkill(actor,"Pray"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
            }) 

            // Perception and Intuition
            let hudPerception = $(`<div class="control-icon tokenhudicon left" title="${TooltipPerception}"><i class="fas fa-eye">&nbsp;${perception}</i></div>`);
            html.find(`.control-icon${hudDataTarget}`).before(hudPerception);  // Add Perception token tip

            // Add interactions for Perception and Intuition
            hudPerception.find("i").dblclick(async (ev) => {
                GMToolkit.log(false, `Perception hud extension double-clicked.`) 
                if (ev.altKey) {
                    let skill = (hasSkill(actor,"Intuition"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
                if (ev.ctrlKey) {
                    let skill = (hasSkill(actor,"Perception"))
                    if (skill != null) {
                        actor.setupSkill(skill).then(setupData => {actor.basicTest(setupData)});
                    }
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                }
            })

        }
    }

}

// Hooks

Hooks.on("ready", () => {
    if (game.settings.get(GMToolkit.MODULE_ID, "enableTokenHudExtensions")) {  
        Hooks.on("renderTokenHUD", (app, html, data) => { TokenHudExtension.addTokenHudExtensions(app, html, data) });
        GMToolkit.log(false, `Token Hud Extensions loaded.`);
    }    else {
        GMToolkit.log(false, `Token Hud Extensions not loaded.`);
    }

});
