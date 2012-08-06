// Copyright: All contributers to the Umple Project
// This file is made available subject to the open source license found at:
// http://umple.org/license
//
// Actions triggered by UI elements in UmpleOnline
// plus helper functions
Action = new Object();
Action.waiting_time = 1500;
Action.oldTimeout = null;
Action.newClass = null;
Action.newAssociation = null;
Action.newGeneralization = null;
Action.minCanvasSize = null;
Action.elementClicked = false;
Action.textUpdateQueue = [];
Action.canCreateByDrag = true;
Action.manualSync = false;
Action.diagramInSync = true;
Action.freshLoad = false;
Action.gentime = new Date().getTime();

Action.clicked = function(event)
{
  Page.clickCount += 1;
  
  var obj = event.currentTarget;
  var action = obj.id.substring(6);
  
  if (action == "PhpCode")
  {
    Action.generateCode("php","Php");
  }
  else if (action == "RubyCode")
  {
    Action.generateCode("ruby","Ruby");
  }
  else if (action == "JavaCode")
  {
    Action.generateCode("java","Java");
  }
    else if (action == "CppCode")
  {
    Action.generateCode("cpp","Cpp");
  }
  else if (action == "SQLCode")
  {
    Action.generateCode("sql","Sql");
  }
  else if (action == "JavaAPIDoc")
  {
    Action.generateCode("javadoc","javadoc");
  }
  else if (action == "EcoreCode")
  {
    Action.generateCode("xml","Ecore");
  }
  else if (action == "GenerateCode")
  {
    var languageAndGenerate = $("inputGenerateCode").value.split(":");
    Action.generateCode(languageAndGenerate[0],languageAndGenerate[1]);
  }
  else if (action == "SimulateCode")
  {
    Action.simulateCode();
  }
  else if (action == "StartOver")
  {
    Action.startOver();
  }
  else if (action == "PngImage")
  {
    Action.pngImage();
  }
  else if (action == "YumlImage")
  {
    Action.yumlImage();
  }
  else if (action == "Jsf")
  {
    Action.uigu();
  }
  else if (action == "Larger")
  {
    Action.umpleCanvasResized(1);
  }
  else if (action == "Smaller")
  {
    Action.umpleCanvasResized(-1);
  }
  else if (action == "Copy")
  {
    Action.showCodeInSeparateWindow();
  }
  else if (action == "CopyEncodedURL")
  {
    Action.showEncodedURLCodeInSeparateWindow();
  }
  else if (action == "Undo")
  {
    Action.undo();
  }
  else if (action == "Redo")
  {
    Action.redo();
  }
  else if (action == "ShowHideTextEditor")
  {
    Action.showHideTextEditor();
  }
  else if (action == "ShowHideCanvas")
  {
    Action.showHideCanvas();
  }
  else if (action == "ShowHideLayoutEditor")
  {
    Action.showHideLayoutEditor();
  }
  else if (action == "ManualSync")
  {
  	Action.enableManualSync();
  }
  else if (action == "SyncDiagram")
  {
  	Action.processTyping("umpleModelEditor", true);
  }
  else if (action == "PhotoReady")
  {
  	Action.photoReady();
  }
}

Action.focusOn = function(id, gained)
{
  var selector = "#" + id;
  var textEditor = (id == "umpleLayoutEditor" || id == "umpleModelEditor");
  
  if (gained) 
  {
  	if (textEditor || !Page.isPhotoReady())
  	{
  	  jQuery(selector).parent().addClass("focus");
  	  if (textEditor)
      {
        Page.shortcutsEnabled = false;
        if (Page.selectedItem != null) Page.unselectAllToggleTools();
        Action.unselectAll();
      }
    }
  }
  else
  {
    jQuery(selector).parent().removeClass("focus");
    if (textEditor)
    {
      Page.shortcutsEnabled = true;
    }
  }
}

Action.startOver = function()
{
  Page.setUmpleCode("");
  UmpleSystem.merge(null);
  window.location = "umple.php";
  // Action.saveNewFile();
  // location.
  // location.reload();
}

Action.undo = function()
{
  if (jQuery("#buttonUndo").hasClass("disabled")) return;
  Action.redoOrUndo(true);
}

Action.redo = function()
{
  if (jQuery("#buttonRedo").hasClass("disabled")) return;
  Action.redoOrUndo(false);
}

Action.redoOrUndo = function(isUndo)
{
  var afterHistoryChange = "";
  if (Action.manualSync && Action.diagramInSync)
  {
  	Action.diagramInSync = false;
  	Page.enablePaletteItem("buttonSyncDiagram", true);
  	Page.enableDiagram(false);
  }
  
  if (isUndo) afterHistoryChange = History.getPreviousVersion();
  else afterHistoryChange = History.getNextVersion();
  
  if (afterHistoryChange == History.noChange)
  {
  	afterHistoryChange = "";
  }
  Action.freshLoad = true;
  Page.setUmpleCode(afterHistoryChange);
  if (!Action.manualSync) Action.updateUmpleDiagram();
}

// Initial load of a file (e.g. example or blank) at initialization
Action.loadFile = function()
{
  var filename = Page.getFilename();
  if (filename != "")
  {
    Ajax.sendRequest("scripts/compiler.php",Action.loadFileCallback,format("load=1&filename={0}",filename));
  }
  else
  {
    Action.saveNewFile();
  }
}

// Triggered by the above Action.loadFile. Initial load of a file at startup
Action.loadFileCallback = function(response)
{
  Action.freshLoad = true;
  History.save(response.responseText,"loadFileCallback");
  Page.setUmpleCode(response.responseText);
  if (!Action.manualSync) Action.updateUmpleDiagram();
}

Action.saveNewFile = function()
{
  var umpleCode = Page.getUmpleCode();
  var filename = Page.getFilename();
  
  if (filename == "")
  {
    Ajax.sendRequest("scripts/compiler.php",Action.saveNewFileCallback,format("save=1&&umpleCode={0}",umpleCode));
  }
}

Action.saveNewFileCallback = function(response)
{
  Page.setFilename(response.responseText);
}

Action.showHideLayoutEditor = function(doShow)
{
  var layoutEditor = jQuery("#umpleLayoutEditor");
  var modelEditor = jQuery("#umpleModelEditor");
  var newHeight = "";
   
  if (doShow == undefined) doShow = layoutEditor.is(":visible");
  
  if (doShow)  // warning: This works backwards to intuition
  {
  	newHeight = layoutEditor.height() + (modelEditor.height()) + 3;
    layoutEditor.hide(); 	
  }
  else
  {
  	layoutEditor.show();
  	newHeight = modelEditor.height() - (layoutEditor.height()) - 3; 
  }
  modelEditor.height(newHeight);
  if(Page.codeMirrorOn) {
    Page.resizeCodeMirrorEditor(newHeight);
  }
}

Action.showHideTextEditor = function(doShow)
{ 
  var textEditor = jQuery("#textEditorColumn");
  var layoutBox = jQuery("#buttonShowHideLayoutEditor");
  var layoutListItem = jQuery("#layoutListItem");
  var canvas = jQuery("#" + Page.umpleCanvasId());
  var canvasColumn = jQuery("#umpleCanvasColumn");
  var canvasVisible = canvasColumn.is(":visible");
  
  if (doShow == undefined) doShow = !textEditor.is(":visible"); 
    
  if (doShow)
  {
  	textEditor.show();
  	
  	// canvas must be visible in order to change width
  	// if hidden, show temporarily
  	if (!canvasVisible) canvasColumn.show();
  	canvas.width(Action.minCanvasSize.width);
  	if (!canvasVisible) canvasColumn.hide();
  	
  	// disable the show/hide layout editor option
  	layoutBox.attr('disabled', false);
  	layoutBox.css('cursor', 'pointer');
  	layoutListItem.css('color', 'Black');
    if(Page.readOnly) {
      jQuery("#topLine").show(); 
    }
    else {
      jQuery("#linetext").show();
    }
    Page.setUmpleCode(Page.getUmpleCode()); // force reset
  }
  else
  {
  	canvas.width(canvas.width() + textEditor.width());
  	textEditor.hide();
	layoutBox.attr('disabled', true);
	layoutBox.css('cursor', 'not-allowed');
	layoutListItem.css('color', 'DimGray');
	if(Page.readOnly) {
      jQuery("#topLine").hide(); 
    }
    else {
      jQuery("#linetext").hide();
    }
  }
}

Action.showHideCanvas = function(doShow)
{ 
  var canvas = jQuery("#umpleCanvasColumn");
  
  if (doShow == undefined) doShow = !canvas.is(":visible"); 
  if (doShow)
  {
  	canvas.show();
  	Action.manualSync = jQuery("#buttonManualSync").attr('checked');
  	jQuery("#buttonShowHideCanvas").attr('checked',true);
  	
  	if (!Action.manualSync) 
  	{
  	  Action.updateUmpleDiagram();
  	  Action.diagramInSync = true;
  	  Page.enableDiagram(true);
  	}
  	if (Action.manualSync && !Action.diagramInSync) Page.enablePaletteItem('buttonSyncDiagram', true);
  	if (!Action.manualSync || Action.diagramInSync)
  	{
  	  Page.enableCheckBoxItem("buttonPhotoReady", "photoReadyListItem", true);
      Page.enableCheckBoxItem("buttonManualSync", "manualSyncListItem", true);

 	  Page.enablePaletteItem('buttonAddClass', true);
  	  Page.enablePaletteItem('buttonAddAssociation', true);
  	  Page.enablePaletteItem('buttonAddGeneralization', true);
  	  Page.enablePaletteItem('buttonDeleteEntity', true);
  	
  	  Page.initToggleTool('buttonAddClass');
  	  Page.initToggleTool('buttonAddAssociation');
  	  Page.initToggleTool('buttonAddGeneralization');
  	  Page.initToggleTool('buttonDeleteEntity');
  	}
  }
  else
  {
  	canvas.hide();
  	Action.manualSync = true;
  	jQuery("#buttonShowHideCanvas").attr('checked',false);

	Page.enableCheckBoxItem("buttonPhotoReady", "photoReadyListItem", false);
  	Page.enableCheckBoxItem("buttonManualSync", "manualSyncListItem", false);

  	
	Page.enablePaletteItem('buttonAddClass', false);
  	Page.enablePaletteItem('buttonAddAssociation', false);
  	Page.enablePaletteItem('buttonAddGeneralization', false);
  	Page.enablePaletteItem('buttonDeleteEntity', false);
	Page.enablePaletteItem('buttonSyncDiagram', false);

  	Page.removeToggleTool('buttonAddClass');
  	Page.removeToggleTool('buttonAddAssociation');
  	Page.removeToggleTool('buttonAddGeneralization');
  	Page.removeToggleTool('buttonDeleteEntity');
  }
}

Action.pngImage = function()
{
  var jsonText = Json.toString(UmpleSystem);
  var jsonEncodedText = encodeURIComponent(jsonText);
  window.open("scripts/compiler.php?asImage=" + jsonEncodedText, "UMLClassDiagram");
}

Action.yumlImage = function()
{
  var yumlImageSelector = "#buttonYumlImage";
  jQuery(yumlImageSelector).showLoading();
  Action.ajax(Action.yumlImageCallback,"save=1");
}

Action.yumlImageCallback = function(response)
{
  var filename = response.responseText;
  var yumlImageSelector = "#buttonYumlImage";
  jQuery(yumlImageSelector).hideLoading();
  window.open("scripts/compiler.php?asYuml=" + filename, "yumlClassDiagram");
  Page.showViewDone();
}

Action.uigu = function()
{
  var uiguSelector = "#buttonUigu";
  jQuery(uiguSelector).showLoading();
  Action.ajax(Action.uiguCallback,"save=1");
}

Action.uiguCallback = function(response)
{
  var filename = response.responseText;
  var uiguSelector = "#buttonUigu";
  jQuery(uiguSelector).hideLoading();
  window.open("scripts/compiler.php?asUI=" + filename, "showUserInterface");
  Page.showViewDone();
}

Action.showCodeInSeparateWindow = function()
{
  codeWindow = window.open("","UmpleCode","height=500, width=400, left=100, top=100, location=no, status=no, scrollbars=yes");
  codeWindow.document.write('<code><pre id="umpleCode">' + Page.getUmpleCode() + '</pre></code>');
}

Action.showEncodedURLCodeInSeparateWindow = function()
{
  codeWindow = window.open("","UmpleCode","height=500, width=400, left=100, top=100, location=no, status=no, scrollbars=yes");
  codeWindow.document.write('<code><pre id="umpleCode">' + Page.getEncodedURL() + '</pre></code>');
}

Action.simulateCode = function()
{
  simulateButtonSelector = "#buttonSimulateCode";
  jQuery(simulateButtonSelector).showLoading();
  Action.ajax(Action.simulateCodeCallback,"language=Simulate");
}

Action.simulateCodeCallback = function(response)
{
  simulateButtonSelector = "#buttonSimulateCode";
  jQuery(simulateButtonSelector).hideLoading();
  var modelId = response.responseText;
  window.open("../umpleonline/simulate.php?model=" + modelId, "umpleSimulator");
  Page.showViewDone(); 
}

Action.umpleCanvasResizing = function(event, ui)
{
  var currentHeight = ui.size.height;
  var currentWidth = ui.size.width;
  
  Page.setUmpleCanvasSize(currentWidth, currentHeight);
}

Action.umpleCanvasResized = function(factor)
{
  canvasSelector = "#" + Page.umpleCanvasId();
  var currentHeight = jQuery(canvasSelector).height();
  var currentWidth = jQuery(canvasSelector).width();
  
  var inc = 100;
  var newHeight=currentHeight + 0.25*inc*factor;
  var newWidth=currentWidth + inc*factor;
  
  Page.setUmpleCanvasSize(newWidth,newHeight);
}

Action.classSelected = function(obj)
{
  var previouslySelected = Page.selectedClass;
  var newClassSelected = obj;
  
  if (previouslySelected != null)
  {
    Page.selectedClass = null;
    
    // Change background color to white
    jQuery("#"+previouslySelected.id).css('background-color','white');
    
    // Hide anchors on previous class
    var selector = "#" + previouslySelected.id + "_anchor";
    for (var i=0; i<8; i++) jQuery(selector + i).hide();
  }
 
  if (newClassSelected != null)
  {
    jQuery("#umpleCanvas").addClass("unscrollable");
    Page.selectedClass = UmpleSystem.find(newClassSelected.id);
    
    // Change background color to blue
    jQuery("#"+newClassSelected.id).css('background-color', '#F3F6FB');
    
    // Show anchors on new class and remove the hovers
    var selector = "#" + newClassSelected.id + "_anchor";
    var hover = "#" + newClassSelected.id + "_hover";
    for (var i=0; i<8; i++)
    {
      jQuery(selector + i).show();
      jQuery(hover + i).hide();
    }
  }
  else
  {
  	jQuery("#umpleCanvas").removeClass("unscrollable");
  }
}

Action.classHover = function(event,isHovering)
{
  var updateClass = event.currentTarget;
  if (!Action.diagramInSync) return;
  if (Page.selectedClass != null && Page.selectedClass.id == updateClass.id) return;
  
  var displayType = isHovering ? "block" : "none";
  var umpleClass = jQuery("#" + updateClass.id);
  
  // change the background color
  if (isHovering) umpleClass.css("background-color", "#F3F6FB");
  else umpleClass.css("background-color", "white");
  
  // show or hide the hovers (if they are enabled)
  if (Page.canShowHovers())
  {
  	var numHovers = 8;
  	var hoverSelector = "#" + updateClass.id + "_hover";
    for (var i=0; i<numHovers; i++)
    {
      if (isHovering) jQuery(hoverSelector + i).show();
      else jQuery(hoverSelector + i).hide();  
    }
  }
}

Action.unselectAll = function()
{
  Action.classSelected(null);
  Action.associationSelected(null);
  Action.generalizationSelected(null);
}

Action.classClicked = function(event)
{
  if (!Action.diagramInSync) return;
  Action.focusOn("umpleCanvas", true);
  Action.focusOn("umpleModelEditor", false);

  Action.unselectAll();
  Action.elementClicked = true;
  var obj = event.currentTarget;
  
  if (Page.selectedItem == "DeleteEntity")
  {
    Action.classDeleted(obj.id);
  }
  else if (Page.selectedItem == "AddAssociation")
  {
    if (Action.newAssociation == null)
    {
      Action.canCreateByDrag = false;
      Action.createAssociationPartOne(event);
    }
    else
    {
      Action.createAssociationPartTwo(event);
      setTimeout(function(){ Action.canCreateByDrag = true; }, 500);
    }
  }
  else if (Page.selectedItem == "AddGeneralization")
  {
  	if (Action.newGeneralization == null)
    {
      var successful = Action.createGeneralizationPartOne(event);
      if (successful) Action.canCreateByDrag = false;
    }
    else
    {
      Action.createGeneralizationPartTwo(event);
      setTimeout(function(){ Action.canCreateByDrag = true; }, 500);
    }
  }
  
  else
  {
    Action.classSelected(obj);
  }
}

/* Creating an association (via diagram) is divided into two parts:
 * The first is selecting the first class, and
 * then anchoring the first end of the association line.  
 * The second is doing the same for the second chosen class, and then launching
 * necessary actions to add the association to the Umple System
 */
Action.createAssociationPartOne = function(event)
{
  // get the position of the click and compute the first end's position
  var mousePosition = new UmplePosition(event.pageX,event.pageY,0,0);
  var umpleSystem = UmpleSystem.position();
  var classOneX = mousePosition.x - umpleSystem.x;
  var classOneY = mousePosition.y - umpleSystem.y;
  
  // draw a dummy association line and anchor it to the location of the click
  Action.classSelected(event.currentTarget);
  Action.newAssociation = new UmpleAssociation();
  Action.newAssociation.classOneId = event.currentTarget.id;
  Action.newAssociation.classOnePosition = new UmplePosition(classOneX,classOneY,0,0); 
}

Action.createAssociationPartTwo = function(event)
{
  var mousePosition = new UmplePosition(event.pageX,event.pageY,0,0);
  Action.classSelected(event.currentTarget);
  
  if (Action.newAssociation.classOneId <= event.currentTarget.id)
  {
    Action.newAssociation.classTwoId = event.currentTarget.id;
    Action.newAssociation.classTwoPosition = mousePosition.subtract(UmpleSystem.position());
  }
  else
  {
    Action.newAssociation.classTwoId = Action.newAssociation.classOneId;
    Action.newAssociation.classTwoPosition = Action.newAssociation.classOnePosition;
    Action.newAssociation.classOneId = event.currentTarget.id;
    Action.newAssociation.classOnePosition = mousePosition.subtract(UmpleSystem.position());
  }
  
  Action.addAssociation(Action.newAssociation);
}

Action.createGeneralizationPartOne = function(event)
{
  var childClass = UmpleSystem.find(event.currentTarget.id);
  if (childClass.extendsClass != null) return false;
      
  Action.classSelected(event.currentTarget);
  Action.newGeneralization = new UmpleGeneralization();
  Action.newGeneralization.childId = event.currentTarget.id;
  
  umpleSystem = UmpleSystem.position();
  childPositionX = Dom.x(event) - umpleSystem.x;
  childPositionY = Dom.y(event) - umpleSystem.y;
  Action.newGeneralization.childPosition = new UmplePosition(childPositionX,childPositionY,0,0);
}

Action.createGeneralizationPartTwo = function(event)
{
  Action.classSelected(event.currentTarget);
    
  Action.newGeneralization.parentId = event.currentTarget.id;
  Action.newGeneralization.parentPosition = new UmplePosition(Dom.x(event),Dom.y(event),0,0);
  Action.addGeneralization(Action.newGeneralization);
}

Action.associationClicked = function(event)
{
  if (!Action.diagramInSync) return;
  Action.elementClicked = true;
  Action.unselectAll();
  
  var obj = event.currentTarget;
  Action.associationSelected(obj);
}

Action.generalizationClicked = function(event)
{
  if (!Action.diagramInSync) return;
  Action.elementClicked = true;
  Action.unselectAll();
    
  var obj = event.currentTarget;
  Action.generalizationSelected(obj);
}

Action.classDeleted = function(diagramId)
{
  var addToQueue = true;
  var umpleClass = UmpleSystem.find(diagramId);
  var associationsAffected = [];
  var generalizationsAffected = [];
  
  for (var i=0; i<UmpleSystem.umpleAssociations.length; i++)
  {
  	var umpleAssociation = UmpleSystem.umpleAssociations[i];
  	if (umpleAssociation.contains(umpleClass))
  	{
  	  associationsAffected.push(umpleAssociation.id);	
  	}
  }
  for (var i=0; i<UmpleSystem.umpleClasses.length; i++)
  {
  	var currentClass = UmpleSystem.umpleClasses[i];
  	if (currentClass.extendsClass == umpleClass.id)
  	{
  	  generalizationsAffected.push(currentClass.id + "_generalization");
  	}
  }
  
  for (var i=0; i<associationsAffected.length; i++)
  {
  	Action.associationDeleted(associationsAffected[i], addToQueue);
  }
  for (var i=0; i<generalizationsAffected.length; i++)
  {
  	Action.generalizationDeleted(generalizationsAffected[i], addToQueue);
  }
    
  var result = UmpleSystem.removeClass(diagramId);
  var removeClass = Json.toString(result);
  
  if (!Page.repeatToolItem) Page.unselectAllToggleTools();
  Page.showModelLoading();
  Page.showLayoutLoading();
  Action.ajax(Action.updateUmpleTextCallback,format("action=removeClass&actionCode={0}",removeClass));
}

Action.associationDeleted = function(diagramId, addToQueue)
{
  if (addToQueue == undefined) addToQueue = false;
  var removed = UmpleSystem.removeAssociation(diagramId);
  var json = Json.toString(removed);
  
  if (!Page.repeatToolItem) Page.unselectAllToggleTools();
  
  if (addToQueue)
  {
  	var update = new Object();
    update.callback = Action.updateUmpleTextCallback;
    update.post = format("action=removeAssociation&actionCode={0}",json);
    Action.textUpdateQueue.push(update);
  }
  else
  {
    Page.showModelLoading();
    Page.showLayoutLoading();
    Action.ajax(Action.updateUmpleTextCallback,format("action=removeAssociation&actionCode={0}",json));
  }
}

Action.generalizationDeleted = function(diagramId, addToQueue)
{
  if (addToQueue == undefined) addToQueue = false;
  var removed = UmpleSystem.removeGeneralization(diagramId)
  var json = Json.toString(removed);
  
  if (!Page.repeatToolItem) Page.unselectAllToggleTools();
  
  if (addToQueue)
  {
    var update = new Object();
    update.callback = Action.updateUmpleTextCallback;
    update.post = format("action=removeGeneralization&actionCode={0}",json);
    Action.textUpdateQueue.push(update);
  }
  else
  {
    Page.showModelLoading();
    Page.showLayoutLoading();
    Action.ajax(Action.updateUmpleTextCallback,format("action=removeGeneralization&actionCode={0}",json));
  }
  return;
}

Action.associationHover = function(event,isHovering)
{
  if (!Action.diagramInSync) return;
  var updateAssociation = event.currentTarget;
  var umpleAssociation = UmpleSystem.findAssociation(updateAssociation.id);
  
  if (updateAssociation != null && Page.canShowHovers())
  {
  	var hoverCount = 2;
  	var selector = "#" + updateAssociation.id + "_hover";
  	
  	for (var i=0; i<hoverCount; i++)
  	{
      if (isHovering) jQuery(selector+i).show();
      else jQuery(selector+i).hide();
    }
  }
}

Action.generalizationHover = function(event,isHovering)
{
  if (!Action.diagramInSync) return;
  var updateGeneralization = event.currentTarget;
  
  if (updateGeneralization != null && Page.canShowHovers())
  {
  	var selector = "#" + updateGeneralization.id + "_hover";
  	for (var i=0; i<3; i++)
  	{
      if (isHovering) jQuery(selector+i).show();
      else jQuery(selector+i).hide();
    }
  }
}

Action.associationSelected = function(obj)
{
  var isSelected = (obj == null) ? false : true;
  var updateObj = null;
  
  if (Page.selectedItem == "DeleteEntity" && obj != null)
  {
  	var addToQueue = false;
    Action.associationDeleted(obj.id, addToQueue);
    return;
  }  
  
  if (obj != null)
  {
    Page.selectedAssociation = obj;
    updateObj = obj;
  }
  else if (Page.selectedAssociation != null)
  {
    updateObj = Page.selectedAssociation;
    Page.selectedAssociation = null;
  }
  else
  {
    return;  
  }
  
  var anchorCount = 2;
  var anchorSelector = "#" + updateObj.id + "_anchor";
  for (var i=0; i<anchorCount; i++)
  {
  	if (isSelected) jQuery(anchorSelector + i).show();
  	else jQuery(anchorSelector + i).hide();
  }
}

Action.generalizationSelected = function(obj)
{
  var isSelected = (obj == null) ? false : true;
  var updateObj = null;
  
  if (Page.selectedItem == "DeleteEntity" && obj != null)
  {
    var addToQueue = false;
    Action.generalizationDeleted(obj.id, addToQueue);
    return;
  }  
  
  if (obj != null)
  {
    Page.selectedGeneralization = obj;
    updateObj = obj;
  }
  else if (Page.selectedGeneralization != null)
  {
    updateObj = Page.selectedGeneralization;
    Page.selectedGeneralization = null;
  }
  else
  {
    return;  
  }

  var anchorCount = 3;
  var anchorSelector = "#" + updateObj.id + "_anchor";
  for (var i=0; i<anchorCount; i++)
  {
  	if (isSelected) jQuery(anchorSelector + i).show();
  	else jQuery(anchorSelector + i).hide();
  }
}

Action.generateCode = function(languageStyle,languageName)
{
  var generateCodeSelector = "#buttonGenerateCode";
  var actualLanguage = languageName;
  if (Page.getAdvancedMode() == 0 && (languageName == "Cpp" || languageName == "Sql"))
  {
    actualLanguage = "Experimental-"+languageName;
  }
  jQuery(generateCodeSelector).showLoading();
  Action.ajax(function(response) {Action.generateCodeCallback(response,languageStyle);},format("language={0}",actualLanguage),"true");
}

Action.photoReady = function()
{
  var canvasSel = "#" + Page.umpleCanvasId();
  if (Page.isPhotoReady())
  {
    jQuery(canvasSel).addClass("photoReady");	
  }
  else
  {
  	jQuery(canvasSel).removeClass("photoReady");
  }
  
  UmpleSystem.redrawCanvas();
}

Action.generateCodeCallback = function(response,language)
{
  Page.showGeneratedCode(response.responseText,language);
  Action.gentime = new Date().getTime();
  var generateCodeSelector = "#buttonGenerateCode";
  jQuery(generateCodeSelector).hideLoading();
  Page.showCodeDone();
}

Action.classMouseDown = function(event)
{
  if (!Action.canCreateByDrag) return;
  
  if (Page.selectedItem == "AddAssociation" && Action.newAssociation == null)
  {
	Action.createAssociationPartOne(event);
  }
  else if (Page.selectedItem == "AddGeneralization" && Action.newGeneralization == null)
  {
	Action.createGeneralizationPartOne(event);
  }
}

Action.classMouseUp = function(event)
{
  if (!Action.canCreateByDrag) return;
  
  if (Page.selectedItem == "AddAssociation" && Action.newAssociation != null)
  {
  	Action.createAssociationPartTwo(event);
  }
  else if (Page.selectedItem == "AddGeneralization" && Action.newGeneralization != null)
  {
  	Action.createGeneralizationPartTwo(event);
  }
}

Action.mouseMove = function(event)
{
  Page.clickCount = 0;
  
  if (Page.selectedItem == "AddClass")
  {
  	if (Action.newClass == null)
  	{
  	  Action.newClass = new UmpleClass();
  	  Action.newClass.name = "";
  	  Action.newClass.id = "tempClass";
  	}
  	Action.drawClassOutline(event, Action.newClass);
  }
  
  if (Action.newAssociation != null && Page.selectedItem == "AddAssociation")
  {
    Action.drawAssociationLine(event, Action.newAssociation);
  }
  if (Action.newGeneralization != null && Page.selectedItem == "AddGeneralization")
  {
    Action.drawGeneralizationLine(event, Action.newGeneralization);
  }
}

Action.drawClassOutline = function(event, newClass)
{
  var canvasSelector = "#" + Page.umpleCanvasId();
  var screenPosition = new UmplePosition(event.pageX, event.pageY,0,0);
  var mousePosition = screenPosition.subtract(UmpleSystem.position());
  
  newClass.position = new UmplePosition(mousePosition.x, mousePosition.y, UmpleClassFactory.defaultSize.width, UmpleClassFactory.defaultSize.height);
  var classOutline = newClass.drawableClassOutline();
  jQuery(canvasSelector).append(classOutline);
  
  var classSel = "#" + newClass.id;
  var widthSel = classSel + "_width";
  var heightSel = classSel + "_height";
  
  var offset = new Object();
  offset.left = screenPosition.x;
  offset.top = screenPosition.y;
  
  jQuery(classSel).offset(offset);
  jQuery(widthSel).width(newClass.position.width);
  jQuery(heightSel).height(newClass.position.height);
}

Action.drawAssociationLine = function(event, newAssociation)
{
  var canvasSelector = "#" + Page.umpleCanvasId();
  var mousePosition = new UmplePosition(event.pageX - 5, event.pageY + 5,0,0);
  newAssociation.classTwoPosition = mousePosition.subtract(UmpleSystem.position());
  jQuery(canvasSelector).append(newAssociation.drawable());
}

Action.drawGeneralizationLine = function(event, newGeneralization)
{
  var canvasSelector = "#" + Page.umpleCanvasId();
  var generalizationSelector = "#" + newGeneralization.getElementId();
  
  var umpleSystem = UmpleSystem.position();
  var parentX = event.pageX - 5 - umpleSystem.x;
  var parentY = event.pageY + 5 - umpleSystem.y; 
  newGeneralization.parentPosition = new UmplePosition(parentX,parentY,0,0);
  
  jQuery(generalizationSelector).remove();
  jQuery(canvasSelector).append(newGeneralization.drawable(false));
}

Action.umpleCanvasClicked = function(event)
{
  if (Action.elementClicked)
  {
  	Action.elementClicked = false;
  	return;
  }
  
  if (Page.selectedItem == "AddClass")
  {
    var position = new UmplePosition(Math.round(event.pageX),Math.round(event.pageY),0,0);
    Action.addClass(position);
  }
  else if (Page.selectedItem == "AddAssociation" && Action.newAssociation != null)
  {
    if (Page.clickCount > 1)
    {
      Action.removeNewAssociation();
    }
  }
  else if (Page.selectedItem == "AddGeneralization" && Action.newGeneralization != null)
  {
    if (Page.clickCount > 1)
    {
      Action.removeNewGeneralization();
    }
  }
  else
  {
    Action.unselectAll();
  }
}

// Called whenever any change is made on the graphic pane
// such as adding/deleting/moving/renaming class/assoc/generalization
Action.updateUmpleTextCallback = function(response)
{
  History.save(response.responseText, "TextCallback");
  Action.freshLoad = true;

  Page.setUmpleCode(response.responseText);
  // DEBUG
  // Page.setFeedbackMessage("update text callback -");
  // Page.catFeedbackMessage(response.responseText);
  // Page.catFeedbackMessage("-");

  
  if (Action.textUpdateQueue.length > 0)
  {
    var update = Action.textUpdateQueue.shift();
    Action.ajax(update.callback, update.post);
  }
  else
  {
  	Page.hideLoading();
  }
  
  //Uncomment for testing purposes only - to update the image after updating the text
  //Action.updateUmpleDiagram();
}

Action.loadExample = function loadExample()
{
  UmpleSystem.merge(null);
  Page.showCanvasLoading(true);
  Page.showModelLoading(true);
  Page.showLayoutLoading(true);
  Ajax.sendRequest("scripts/compiler.php",Action.loadExampleCallback,"exampleCode=" + Page.getSelectedExample());
  
  var largerSelector = "#buttonLarger";
  var smallerSelector = "#buttonSmaller";
  var canvasSelector = "#" + Page.umpleCanvasId();
 
  umpleCanvasWidth = jQuery(canvasSelector).width();
  umpleCanvasHeight = jQuery(canvasSelector).height();
  
  Page.resetCanvasSize();
  var sel = Page.getSelectedExample();
  if (sel=="Accommodations.ump"){Page.setUmpleCanvasSize(780,500);}
  else if (sel=="2DShapes.ump"){Page.setUmpleCanvasSize(620,500);}
  else if (sel=="AirlineExample.ump"){Page.setUmpleCanvasSize(490,500);}
  else if (sel=="AfghanRainDesign.ump"){Page.setUmpleCanvasSize(920,600);}
  else if (sel=="BankingSystemA.ump"){Page.setUmpleCanvasSize(840,500);}
  else if (sel=="BankingSystemB.ump"){Page.setUmpleCanvasSize(820,550);}
  else if (sel=="DMMOverview.ump"){Page.setUmpleCanvasSize(610,500);}
  else if (sel=="DMMModelElementHierarchy.ump"){Page.setUmpleCanvasSize(935,600);}
  else if (sel=="DMMSourceObjectHierarchy.ump"){Page.setUmpleCanvasSize(740,520);}
  else if (sel=="DMMRelationshipHierarchy.ump"){Page.setUmpleCanvasSize(935,570);}
  else if (sel=="DMMExtensionCTF.ump"){Page.setUmpleCanvasSize(815,620);}
  else if (sel=="ElectionSystem.ump"){Page.setUmpleCanvasSize(680,530);}
  else if (sel=="ElevatorSystemB.ump"){Page.setUmpleCanvasSize(820,550);}
  else if (sel=="GeographicalInformationSystem.ump"){Page.setUmpleCanvasSize(765,550);}
  else if (sel=="Insurance.ump"){Page.setUmpleCanvasSize(650,575);}
  else if (sel=="MailOrderSystemClientOrder.ump"){Page.setUmpleCanvasSize(780,535);}
  else if (sel=="ManufactoringPlantController.ump"){Page.setUmpleCanvasSize(620,505);}
    else if (sel=="ManufacturingPlantController.ump"){Page.setUmpleCanvasSize(620,505);}
  else if (sel=="InventoryManagement.ump"){Page.setUmpleCanvasSize(625,570);}
  else if (sel=="Hospital.ump"){Page.setUmpleCanvasSize(650,400);}
  else if (sel=="Hotel.ump"){Page.setUmpleCanvasSize(820,550);}
  else if (sel=="Library.ump"){Page.setUmpleCanvasSize(780,500);}
  else if (sel=="PoliceSystem.ump"){Page.setUmpleCanvasSize(725,570);} 
  else if (sel=="realestate.ump"){Page.setUmpleCanvasSize(730,530);}
  else if (sel=="WarehouseSystem.ump"){Page.setUmpleCanvasSize(700,550);}

  else if (sel=="UniversitySystem.ump"){Page.setUmpleCanvasSize(600,500);}  
  else if (sel=="CoOpSystem.ump"){Page.setUmpleCanvasSize(700,550);}
  else if (sel=="CommunityAssociation.ump"){Page.setUmpleCanvasSize(720,590);}
  else if (sel=="Pizza.ump"){Page.setUmpleCanvasSize(700,570);}
  else if (sel=="VendingMachineClassDiagram.ump"){Page.setUmpleCanvasSize(540,650);}
  else if (sel=="OhHellWhist.ump"){Page.setUmpleCanvasSize(700,550);}
  else if (sel=="CanalLockStateMachine.ump"){Page.setUmpleCanvasSize(700,550);}
  else if (sel=="CanalSystem.ump"){Page.setUmpleCanvasSize(790,600);}  
  else if (sel=="RoutesAndLocations.ump"){Page.setUmpleCanvasSize(700,680);}
  
          
  jQuery("#inputExample").blur();
}

Action.loadExampleCallback = function(response)
{
  Action.freshLoad = true;
  Page.setUmpleCode(response.responseText);
  Page.hideLoading();
  History.save(response.responseText, "loadExampleCallback");
  Action.updateUmpleDiagram();
  Action.setCaretPosition("0");
  Action.updateLineNumberDisplay();

}

Action.customSizeTyped = function()
{
  if (Action.oldTimeout != null)
  {
    clearTimeout(Action.oldTimeout);
  }
  
  var width = jQuery("#widthField").val();
  var height = jQuery("#heightField").val();
  
  Action.oldTimeout = setTimeout(function(){ Page.setUmpleCanvasSize(width, height); }, Action.waiting_time);
}

Action.moveSelectedClass = function(umpleClass, delta)
{
  if (umpleClass == null) return;
  
  umpleClass.position = umpleClass.position.add(delta);
  UmpleSystem.updateClass(umpleClass);
  Action.classSelected(umpleClass);
  
  if (Action.oldTimeout != null)
  {
  	clearTimeout(Action.oldTimeout);
  }
  Action.oldTimeout = setTimeout(function() {Action.classMoved(Page.selectedClass);}, 1000); 
}

Action.keyboardShortcut = function(event)
{
  if (!Page.shortcutsEnabled)
  {
  	return;
  }
  
  var shortcut = event.which;
  
  if (shortcut == 27)		// escape
  {
  	Page.unselectAllToggleTools();
  }
  else if (shortcut == 40) 	// down
  {
    Action.moveSelectedClass(Page.selectedClass, new UmplePosition(0,1,0,0));
  }
  else if (shortcut == 38) 	// up
  {
  	Action.moveSelectedClass(Page.selectedClass, new UmplePosition(0,-1,0,0));
  }
  else if (shortcut == 37) 	// left
  {
  	Action.moveSelectedClass(Page.selectedClass, new UmplePosition(-1,0,0,0));
  }
  else if (shortcut == 39) 	// right
  {
  	Action.moveSelectedClass(Page.selectedClass, new UmplePosition(1,0,0,0));
  }
}

Action.getCaretPosition = function() // TIM Returns the line number
{
	var ctrl = document.getElementById('umpleModelEditor');
	
	var CaretPos = Action.getInputSelectionStart(ctrl);
	
	var nlcount=1;
	var theCode=Page.getRawUmpleCode();

	for(var ch=0; ch<(CaretPos); ch++)
	{
	   if(theCode.charAt(ch)=="\n") nlcount++;
	   
	   // The following for debugging
	   if (Page.getAdvancedMode() == 2 && ch < 15) { // debug
	     Page.catFeedbackMessage("<"+ch+" "+theCode.charAt(ch)+"="+theCode.charCodeAt(ch)+"> ");
	   }
	}
	return nlcount;
}

// The following from http://stackoverflow.com/questions/263743/how-to-get-cursor-position-in-textarea/3373056#3373056
Action.getInputSelectionStart = function(el) {
    var start = 0, normalizedValue, range, textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
      start = el.selectionStart;
      // The following for debugging
	  if (Page.getAdvancedMode() == 2) { // debug
	    Page.setFeedbackMessage("Non-IE browser ");
      }
    }
    else { // IE Support
      // The following for debugging
	  if (Page.getAdvancedMode() == 2) { // debug
	    Page.setFeedbackMessage("IE-type browser ");
      }
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;
            }
        }
    }

    return start;
}

Action.setCaretPosition = function(line){
  if(isNaN(line-0)) {
    // It is not a number so must be a special hidden command
    if(line=="av") {
      // Special backdoor to turn on experimental features
      document.getElementById('advancedMode').value=1;
      Page.setFeedbackMessage("");
      return;
    }
    if(line=="db") { // turn on debugging and do certain debugging options
      document.getElementById('advancedMode').value=2;
      Page.setFeedbackMessage("Debug Mode");
      return;
    }
    if(line.substr(0,2)=="cm") {
      if(line.substr(2,1)=="0" && Page.codeMirrorOn) {
        Page.setFeedbackMessage("Turning code mirroring off");
        Page.codeMirrorEditor.toTextArea();
        Page.codeMirrorOn=false;
        jQuery("#linenum").val("0");
      }
      else if(line.substr(2,1)=="1" && !Page.codeMirrorOn) {
        Page.initCodeMirrorEditor();
        jQuery("#linenum").val("0");
      }
      return;
    }
    else
    {
      Page.setFeedbackMessage("Invalid line number entered");
      return;
    }
  }
  if(Page.codeMirrorOn) {
    Page.codeMirrorEditor.setSelection({line: line-1,ch: 0},{line: line-1,ch: 999999});
    Page.codeMirrorEditor.focus();
    return;
  }
  var ctrl = document.getElementById('umpleModelEditor');
  var startPos=0;
  var endPos=-1;

  if(line<1)
  {
    endPos=0;
  }
  else
  {
    var theCode=Page.getRawUmpleCode();
    for(var ch=0; ch<theCode.length; ch++)
    {
      if(theCode.charAt(ch)=='\n')
      {
        line--;
        if(line==1) startPos=ch+1;
        if(line==0) {
          endPos=ch; 
          break;
        }
      }
    }
    if(endPos==-1) { // got to end
      endPos=theCode.length;
      if(line!=1) startPos=endPos;
    }
  }

  if(ctrl.setSelectionRange)
  {
    ctrl.focus();
    ctrl.setSelectionRange(startPos,endPos);
  }
  else if (ctrl.createTextRange) {
    var range = ctrl.createTextRange();
    range.collapse(true);
    range.moveEnd('character', endPos);
    range.moveStart('character', startPos);
    range.select();
  }
}

Action.delayedFocus = function(ms) {
  var ctrl=document.getElementById('umpleModelEditor');
  setTimeout(function() {ctrl.focus();},ms);
}

Action.updateLineNumberDisplay = function()
{
  jQuery("#linenum").val(Action.getCaretPosition());
}

Action.umpleTyped = function(eventObject)
{
  // This function is not called by CodeMirror
  // See umpleCodeMirrorTypingActivity if CodeMirror is on (as it normally is)
  // debug - output key code
  if (Page.getAdvancedMode() == "2") { // debug
     Page.catFeedbackMessage("["+eventObject.keyCode+"] ");
  }
  Action.updateLineNumberDisplay();

  var eventCode = eventObject.keyCode;
  
  // Ignore 33=pgup 34=pgdn 35=end 36=hom 37=lef 38=up 39=rt 40=dn
  if(eventCode>=33 && eventCode <=40) return;

  var target = eventObject.target.id;
  Action.umpleTypingActivity(target);
}

Action.umpleCodeMirrorCursorActivity = function() {
  var line = Page.codeMirrorEditor.getCursor(true).line+1;
  jQuery("#linenum").val(line);
}

Action.umpleCodeMirrorTypingActivity = function() {
  if(Action.freshLoad == false) {
    Page.codeMirrorEditor.save();
    Action.umpleTypingActivity("codeMirrorEditor");
  }
  else {
    Action.freshLoad = false;
  }
}

Action.umpleTypingActivity = function(target) {
  if (Action.manualSync && Action.diagramInSync)
  {
  	if (jQuery("#umpleCanvasColumn").is(":visible")) Page.enablePaletteItem("buttonSyncDiagram", true);
  	Action.diagramInSync = false;
  	Page.enableDiagram(false);
  }
  
  if (Action.oldTimeout != null)
  {
    clearTimeout(Action.oldTimeout);
  }
  Action.oldTimeout = setTimeout('Action.processTyping("' + target + '",' + false + ')', Action.waiting_time);
}

Action.processTyping = function(target, manuallySynchronized)
{
  History.save(Page.getUmpleCode(), "processTyping");
  if (!Action.manualSync || manuallySynchronized)
  {
    if (target == "umpleModelEditor" || target == "codeMirrorEditor") {
      Action.updateLayoutEditorAndDiagram();
    }
    else Action.updateUmpleDiagram();
    Action.diagramInSync = true;
    Page.enablePaletteItem("buttonSyncDiagram", false);
    Page.enableDiagram(true);
  }
}

Action.updateLayoutEditorAndDiagram = function()
{
  Action.ajax(Action.updateUmpleLayoutEditor,"language=Json");
}

Action.updateUmpleLayoutEditor = function(response)
{
  var umpleJson = response.responseText;
  Page.showLayoutLoading();
  //TODO: for some reason in the live version this call isnt being made
  //but oddly the diagram is updated, and that is done in the callback
  Action.ajax(Action.updateUmpleLayoutEditorCallback,format("action=addPositioning&actionCode={0}",umpleJson));  
}

Action.updateUmpleLayoutEditorCallback = function(response)
{
  var umpleCode = response.responseText;
  var positioning = Page.splitUmpleCode(umpleCode)[1];
  
  Page.setUmplePositioningCode(positioning);
  Page.hideLoading();
  Action.updateUmpleDiagram();
}

Action.updateUmpleDiagram = function()
{
  Page.showCanvasLoading();
  Action.ajax(Action.updateUmpleDiagramCallback,"language=Json");
}

Action.updateUmpleDiagramCallback = function(response)
{
  var codeparts = response.responseText.split('URL_SPLIT');
  var errorMessage=codeparts[0];
  var umpleJson=codeparts[1];
  
  if(umpleJson == "null" || umpleJson == "") {
    Page.enableDiagram(false);
    Action.diagramInSync = false;
    Page.setFeedbackMessage("The Umple model/code cannot be compiled; <a href=\"\#errorClick\">see explanation at the bottom.</a> To fix: edit the text or click undo");
    Page.showGeneratedCode(errorMessage,"diagramUpdate");
  }
  else {  // reset feedback message when error is corrected
    if(!Action.diagramInSync)
    {
      Page.enableDiagram(true);
      Action.diagramInSync=true;
    }
    Page.setFeedbackMessage("");
    if (new Date().getTime()-Action.gentime > 5000)
    {
      // Erase generated code if it was generated a long time ago
      Page.hideGeneratedCode();
    }
    var newSystem = Json.toObject(umpleJson);
    UmpleSystem.merge(newSystem);
    if (Page.readOnly) {
  	  jQuery("span.editable").addClass("uneditable");
  	  // jQuery("div.umpleClass").addClass("unselectable");
    }
  }
  
  Page.hideLoading();
}

Action.addClass = function(position)
{
  Action.removeNewClass();
  var umpleClass = UmpleSystem.createClass(position);
  var umpleJson = Json.toString(umpleClass);
  
  if (!Page.repeatToolItem) Page.unselectAllToggleTools();
  Page.showModelLoading();
  Page.showLayoutLoading();
  Action.ajax(Action.updateUmpleTextCallback,format("action=addClass&actionCode={0}",umpleJson));
}

/* Create an association based on the temporary association
 * line drawn in the diagram using "add association" drawing tool
 */
Action.addAssociation = function(line)
{
  // the line shown when selecting participating classes
  // is a dummy - erase it and create association 
  Action.removeNewAssociation();
  var umpleAssociation = UmpleSystem.createAssociation( line.classOneId,
  														line.classTwoId,
  														line.classOnePosition.add(UmpleSystem.position()),
  														line.classTwoPosition.add(UmpleSystem.position()));
  // obtain the json representation of the association
  var umpleJson = Json.toString(umpleAssociation);
  
  // unselect all drawing tools in the palette and show loading images
  if (!Page.repeatToolItem) Page.unselectAllToggleTools();
  Page.showModelLoading();
  Page.showLayoutLoading();
  
  Action.ajax(Action.updateUmpleTextCallback,format("action=addAssociation&actionCode={0}",umpleJson));
}

Action.addGeneralization = function(umpleGeneralization)
{
  Action.removeNewGeneralization();
  UmpleSystem.createGeneralization(umpleGeneralization.childId, umpleGeneralization.parentId);
  var umpleJson = Json.toString(umpleGeneralization);
  
  if (!Page.repeatToolItem) Page.unselectAllToggleTools();
  Page.showModelLoading();
  Page.showLayoutLoading();
  
  Action.ajax(Action.updateUmpleTextCallback,format("action=addGeneralization&actionCode={0}",umpleJson));
}

Action.classMoved = function(targetClass)
{
  var umpleClassMoved = UmpleSystem.find(targetClass.id);
  var classObj = jQuery("#" + umpleClassMoved.id);
 
  // assure the offsets are round numbers
  newPositionX = Math.round(classObj.offset().left);
  newPositionY = Math.round(classObj.offset().top);
  UmpleSystem.updatePosition(umpleClassMoved,newPositionX,newPositionY);
  
  var editClass = Json.toString(umpleClassMoved);
  var umpleCode = Page.getUmpleCode();
  
  // make call to the back end to update the umple code
  Page.showLayoutLoading();
  Action.ajax(Action.updateUmpleTextCallback,format("action=editClass&actionCode={0}",editClass));
  Action.classSelected(targetClass);
  
  UmpleSystem.trimOverlappingAssociations(umpleClassMoved);
}

Action.classResizing = function(event, ui)
{
  var classId = event.target.id;
  var umpleClass = UmpleSystem.find(classId);
  var classSel = "#" + classId;
  
  var newWidth = Math.round(jQuery(classSel).width());
  var newHeight = Math.round(jQuery(classSel).height());
  
  UmpleSystem.updatingSize(umpleClass,newWidth,newHeight);
}

Action.classResized = function(event, ui)
{
  var classDiv = event.target;
  var id = classDiv.id;
  var umpleClass = UmpleSystem.find(id);
  
  UmpleSystem.updateClass(umpleClass);
  UmpleSystem.redrawGeneralizationsTo(umpleClass, addToQueue);
  
  // update the position (in umple code) of any association affected
  for (var i=0; i<UmpleSystem.umpleAssociations.length; i++)
  {
    var umpleAssociation = UmpleSystem.umpleAssociations[i];
    if (umpleAssociation.contains(umpleClass))
    {
      var isClassOne = umpleAssociation.classOneId == umpleClass.id;
      var offset = isClassOne ? umpleAssociation.offsetOnePosition : umpleAssociation.offsetTwoPosition;
    
      var anchorId = isClassOne ? "_anchor0" : "_anchor1";
      var dragDivSelector = "#" + umpleAssociation.id + anchorId;
      var addToQueue = true;
    
      Action.associationMoved(dragDivSelector, addToQueue);
    }
  }
  
  var editClass = Json.toString(umpleClass);
  var umpleCode = Page.getUmpleCode();
  
  Page.showLayoutLoading();
  Action.ajax(Action.updateUmpleTextCallback,format('action=editClass&actionCode={0}',editClass));
  Action.classSelected(classDiv);
}

Action.associationSnap = function(x, y, dragDivSel) 
{
  var id = jQuery(dragDivSel).attr("id");
  var elementId = id.substr(0,id.lastIndexOf("_"));
  var index = id.substr(id.lastIndexOf("_") + "anchor".length + 1);
  var association = UmpleSystem.findAssociation(elementId);
  var umpleClass = association.getClass(index);
  var perimeter = UmpleClassFactory.perimeterPosition(umpleClass,new UmplePosition(x,y,0,0),UmpleSystem.position());
  return [perimeter.x, perimeter.y];
}

Action.regularAssociationMoving = function(dragSelector)
{
  if (Action.newAssociation == null)
  {
    var dragId = jQuery(dragSelector).attr("id");
    var id = dragId.substr(0,dragId.length - "_anchorX".length);

    // get the association being moved and create a temporary one
    // to display movement
    var association = UmpleSystem.findAssociation(id);
    var dragAssociation = new UmpleAssociation();
    
    // identify which end is being moved and update its attributes
    if (dragId.endsWith("_anchor0"))
    {
      dragAssociation.classOneId = association.classTwoId;
      dragAssociation.classOnePosition = association.classTwoPosition;
      dragAssociation.offsetOnePosition = association.offsetTwoPosition;
    }
    else
    {
      dragAssociation.classOneId = association.classOneId;
      dragAssociation.classOnePosition = association.classOnePosition;
      dragAssociation.offsetOnePosition = association.offsetOnePosition;
    } 
    Action.newAssociation = dragAssociation;
  }
  
  var dragOffset = jQuery(dragSelector).offset();
  var xys = Action.associationSnap(Math.round(dragOffset.left),Math.round(dragOffset.top),dragSelector);
  var screenPosition = new UmplePosition(xys[0],xys[1]);
  Action.newAssociation.classTwoPosition = screenPosition.subtract(UmpleSystem.position());
  Action.newAssociation.offsetTwoPosition = new UmplePosition(0,0,0,0);

  var canvasSelector = "#" + Page.umpleCanvasId();
  jQuery(canvasSelector).append(Action.newAssociation.drawable());
}

Action.reflexiveAssociationMoving = function(dragSelector)
{
  var dragId = jQuery(dragSelector).attr("id");
  var id = dragId.substr(0,dragId.length - "_anchorX".length);
  var association = UmpleSystem.findAssociation(id);
  
  if (Action.newAssociation == null)
  {
  	Action.newAssociation = new UmpleAssociation();
  	Action.newAssociation.classOneId = association.classOneId;
    Action.newAssociation.classTwoId = association.classTwoId;
    Action.newAssociation.classOnePosition = association.classOnePosition;
    Action.newAssociation.classTwoPosition = association.classTwoPosition;
    Action.newAssociation.offsetOnePosition = association.offsetOnePosition;
    Action.newAssociation.offsetTwoPosition = association.offsetTwoPosition;
    Action.newAssociation.id = Action.newAssociation.getElementId();
  }
  
  var dragOffset = jQuery(dragSelector).offset();
  var xys = Action.associationSnap(Math.round(dragOffset.left),Math.round(dragOffset.top),dragSelector);
  var screenPosition = (new UmplePosition(xys[0],xys[1],0,0));
  var offset = screenPosition.subtract(UmpleSystem.position());
  offset.x = offset.x - Action.newAssociation.classOnePosition.x;
  offset.y = offset.y - Action.newAssociation.classOnePosition.y;
  
  if (dragId.endsWith("_anchor0")) Action.newAssociation.offsetOnePosition = offset;
  else Action.newAssociation.offsetTwoPosition = offset;
  
  var canvasSelector = "#" + Page.umpleCanvasId();
  jQuery(canvasSelector).append(Action.newAssociation.drawableReflexive());
}

Action.updateMovedAssociation = function(dragDivSel, association)
{
  jQuery(dragDivSel).show();
  var dragOffset = jQuery(dragDivSel).offset();
  var dragDivId = jQuery(dragDivSel).attr("id");
  jQuery(dragDivSel).hide();
  
  var left = Math.round(dragOffset.left);
  var top = Math.round(dragOffset.top);
  
  var xys = Action.associationSnap(left,top,dragDivSel);
  var screenPosition = (new UmplePosition(xys[0],xys[1],0,0));  
  
  if (dragDivId.endsWith("_anchor0"))
  {
    association.setOffsetOnePosition(screenPosition);
  }
  else
  {
    association.setOffsetTwoPosition(screenPosition);
  }
  
  UmpleSystem.redrawAssociation(association);
  Action.associationSelected(null);
}

Action.associationMoved = function(dragDivSelector, addToQueue)
{
  if (Action.newAssociation != null) Action.removeNewAssociation();
  if (addToQueue == undefined) addToQueue = false;
  
  var dragDivId = jQuery(dragDivSelector).attr("id");
  var associationId = dragDivId.substr(0, dragDivId.length - "_anchorX".length);
  var association = UmpleSystem.findAssociation(associationId);
  
  Action.updateMovedAssociation(dragDivSelector, association);
    
  var editAssociation = Json.toString(association);
  
  if (addToQueue)
  {
    var update = new Object();
    update.callback = Action.updateUmpleTextCallback;
    update.post = format("action=editAssociation&actionCode={0}",editAssociation);
    Action.textUpdateQueue.push(update);
  }
  else
  {
    Page.showLayoutLoading();
    Action.ajax(Action.updateUmpleTextCallback,format("action=editAssociation&actionCode={0}",editAssociation));
  }
}

Action.classNameChanged = function(diagramId,oldName,newName)
{
  if(newName.length=0 || !newName.match(/^[_a-zA-Z1-8]+$/))
  {

    Action.updateUmpleDiagram();
    var message="Class names must be alphanumeric. &lt;"+(newName.split("&").join("&amp;").split( "<").join("&lt;").split(">").join("&gt;")
)+"&gt is not valid.";
    setTimeout(function() {Page.setFeedbackMessage(message);},2000);
    setTimeout(function() {if(true) {Page.setFeedbackMessage("");}},10000);
  }
  else
  {
    var umpleClass = UmpleSystem.renameClass(diagramId,oldName,newName);

    var editClass = Json.toString(umpleClass);
    delete umpleClass.oldname;
  
    Page.showModelLoading();
    Page.showLayoutLoading();
     Action.ajax(Action.updateUmpleTextCallback,format("action=editClass&actionCode={0}",editClass));
    }
}

Action.validateAttributeName = function(newAttribute)
{
  return newAttribute.length!=0  && (
     newAttribute.match(/^[_a-zA-Z1-8]+$/) ||
     newAttribute.match(/^[_a-zA-Z1-8]+[\u0020]*:[\u0020]*[_a-zA-Z1-8]+$/)
     )
}

Action.attributeNameChanged = function(diagramId,index,oldName,newAttribute)
{
  if(!Action.validateAttributeName(newAttribute))
  {
    Action.updateUmpleDiagram();
    setTimeout(function() {Page.setFeedbackMessage("UML Attributes must be alphanumeric with an optional type after a colon. &lt;"+(newAttribute.split("&").join("&amp;").split( "<").join("&lt;").split(">").join("&gt;")
)+"&gt is not valid.");},2000);
    setTimeout(function() {if(true) {Page.setFeedbackMessage("");}},10000);
  }
  else
  {
    var umpleClass = UmpleSystem.find(diagramId);
    umpleClass.attributes[index].set(newAttribute);
    UmpleSystem.redraw(umpleClass);
  
    var editClass = Json.toString(umpleClass);
    Page.showModelLoading();
      Action.ajax(Action.updateUmpleTextCallback,format("action=editClass&actionCode={0}",editClass));
    umpleClass.resetAttribute(index);
  }
}

Action.attributeNew = function(diagramId,attributeInput)
{
  if(!Action.validateAttributeName(attributeInput))
  {
     Action.updateUmpleDiagram();
    setTimeout(function() {Page.setFeedbackMessage("UML Attributes must be alphanumeric with an optional type after a colon. &lt;"+(attributeInput.split("&").join("&amp;").split( "<").join("&lt;").split(">").join("&gt;")
)+"&gt is not valid.");},2000);
    setTimeout(function() {if(true) {Page.setFeedbackMessage("");}},10000);
  }
  else
  {
    var umpleClass = UmpleSystem.find(diagramId);
    var attributeIndex = umpleClass.addAttribute(attributeInput);

    var editClass = Json.toString(umpleClass);
    Page.showModelLoading();
      Action.ajax(Action.updateUmpleTextCallback,format("action=editClass&actionCode={0}",editClass));

    umpleClass.resetAttribute(attributeIndex);
    UmpleSystem.updateClass(umpleClass);
    UmpleSystem.redrawGeneralizationsTo(umpleClass);
    UmpleSystem.trimOverlappingAssociations(umpleClass);
  }
}

Action.attributeDelete = function(diagramId,index)
{
  var umpleClass = UmpleSystem.find(diagramId);
  umpleClass.removeAttribute(index);

  var editClass = Json.toString(umpleClass);
  Page.showModelLoading();
  Action.ajax(Action.updateUmpleTextCallback,format("action=editClass&actionCode={0}",editClass));

  umpleClass.resetAttribute(index);
  UmpleSystem.updateClass(umpleClass);
}

InlineEditor.elementChanged = function(obj, oldVal, newVal)
{
  var editType = obj.attr("name");
  var objId = obj.attr("id");
  
  if (editType == "className")
  {
    var id = objId.substr(0,objId.length - "_name".length);
    Action.classNameChanged(id,oldVal,newVal);
  }
  else if (editType == "attributeEdit")
  {
    var index = objId.substr(objId.lastIndexOf("_") + 1);
    var id = objId.substr(0,objId.length - "_attribute_".length - index.length);
    Action.attributeNameChanged(id,index,oldVal,newVal);
  }
  else if (editType == "attributeNew")
  {
    var id = objId.substr(0,objId.length - "_newAttribute".length);
    Action.attributeNew(id,newVal);
  }
}

Action.removeNewClass = function()
{
  if (Action.newClass != null)
  {
    var classSelector = "#" + Action.newClass.id;
    Action.newClass = null;
    jQuery(classSelector).remove();
  }
}

Action.removeNewAssociation = function()
{
  if (Action.newAssociation != null)
  {
    var lineSelector = "#"+Action.newAssociation.getElementId();
    jQuery(lineSelector).remove();
    Action.newAssociation = null;
  }
}

Action.removeNewGeneralization = function()
{
  if (Action.newGeneralization != null)
  {
    var lineSelector = "#" + Action.newGeneralization.getElementId();
    jQuery(lineSelector).remove();
    Action.newGeneralization = null;
  }
}

Action.enableManualSync = function(enable)
{
  var checkbox = jQuery("#buttonManualSync");
  var syncDiagram = jQuery("#buttonSyncDiagram");
  if (enable == undefined) enable = checkbox.is(":checked");
  
  if (enable)
  {
	Action.manualSync = true;
  }
  else
  {
  	Action.manualSync = false;
  	Action.processTyping("umpleModelEditor",true);
  	Page.enablePaletteItem("buttonSyncDiagram", false);
  }
}

Action.ajax = function(callback,post,errors)
{
  var modelAndPositioning = Page.getUmpleCode();
  var umpleCode = encodeURIComponent(modelAndPositioning);
  var filename = Page.getFilename();
  // var errors = typeof(errors) != 'undefined' ? errors : "false";
  var errors = "true";    
    Ajax.sendRequest("scripts/compiler.php",callback,format("{0}&error={3}&umpleCode={1}&filename={2}",post,umpleCode,filename,errors));
}
