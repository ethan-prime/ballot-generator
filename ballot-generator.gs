function generateBallot() {
  
  var ui = SpreadsheetApp.getUi();

  prompt = ui.prompt(`Please input the name for the Google Form to be created.`, ui.ButtonSet.OK);
  formName = prompt.getResponseText();
  var form = FormApp.create(formName);

  form.setDescription('Auto-generated ballot.') //GENERATE SKELETON BALLOT
    .setCollectEmail(true)
    .setLimitOneResponsePerUser(true)
    .setAllowResponseEdits(false)
    .setRequireLogin(true)
    .setShowLinkToRespondAgain(false)
    .setConfirmationMessage('Thanks for voting!');

  prompt = ui.prompt(`Please input from which Spreadsheet to make the ballot. Example: Sr Boys, Jr Boys, Soph Girls. Each category is listed at the bottom of the page. IMPORTANT: to combine mutiple categories into one (such as a ballot with  Sr Boys and Sr Girls), input them both but separate with a comma ,. IT IS CASE-SENSITIVE. So 
"Sr Boys" cannot be typed as "sr boys"`, ui.ButtonSet.OK);

  ballot = prompt.getResponseText(); //CONVERT BALLOT TEXT TO READABLE TEXT BY COMPUTER
  ballot = ballot.split(',');
  for(var i = 0;i<ballot.length;i++) {
    ballot[i] = ballot[i][0].replace(' ', '')+ballot[i].slice(1);
  }

  var names = []; 

  for(var n=0;n<ballot.length;n++) {
    newNames = getNamesAndGenerateSelection(ballot[n]); //RUN FUNCTION ON ALL SUB-BALLOT LISTED
    for(var m=0;m<newNames.length;m++) {
      names.push(newNames[m]);
    }
  }

  function getNamesAndGenerateSelection(ballot) {
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ballot); //OPEN CLASS LIST SPREADSHEET

    prompt = ui.prompt(`Please input ALL names (separated by a comma ,) to EXCLUDE from ${ballot} ballot.`, ui. ButtonSet.OK);

    var exclude = prompt.getResponseText(); //INTERPERET EXCLUDED NAMES INTO LIST
    exclude = exclude.split(',')
    for(var i = 0;i<exclude.length;i++) {
      try {
        exclude[i] = exclude[i][0].replace(' ', '')+exclude[i].slice(1);
        exclude[i] = exclude[i].toLowerCase();
      } catch {
        //DO NOTHING
      }
    }

    Logger.log(`Excluding names: ${exclude}`);

    var names = [];
    var foundAllRows = false;
    var n = 2;

    while (!foundAllRows) { //GET ALL NAMES

      firstName = sheet.getRange("A"+n).getValue();
      lastName = sheet.getRange("B"+n).getValue();

      if (firstName == '' || firstName == null || lastName == '' || lastName == null) {
        foundAllRows = true;
      } else {
        if (exclude.includes(`${firstName.toLowerCase()} ${lastName.toLowerCase()}`)) { //SEE IF IT'S AN EXCLUDED NAME OR NOT
          //DO NOTHING
        } else {
          firstName = firstName[0].toUpperCase() + firstName.slice(1).toLowerCase(); //CONVERT TO CONVENTENTIAL Name Case
          lastName = lastName[0].toUpperCase() + lastName.slice(1).toLowerCase();
          names.push(`${firstName} ${lastName}`);
        }
      }
      n++;
    }

    choices = []; //ADD CHOICES/SELECTIONS TO BALLOT
    item = form.addCheckboxItem()
    for (x=0;x<names.length;x++) {
      choices.push(item.createChoice(names[x]));
    }

    item.setTitle(`Please vote 1 attendant for ${ballot}:`).setRequired(true).setChoices(choices); 
    Logger.log(`${ballot} portion created with ${names.length} names`);
    
    return names;
  }

  Logger.log(`Ballot completed with ${names.length} names total.`);

}
