<?php
//controller code class declaration
//file is a part of the controller tab list
class igk_default extends IGKDefaultPageController 
// class igk_default extends IGKApplicationController 
//implements IIGKHTMLHorizontalPaneListener
{ 
	
	public function getName(){return get_class($this);}
	
	public function getDb(){
		static $db = null;
		if ($db === null)
			$sb = new igk_default_db_u($this);
		return $db;
	}
	
	
	// protected function InitComplete(){
		// parent::InitComplete();		
		// please enter your controller declaration complete here
		
	// }
	///@@@ init target node
	// protected function initTargetNode(){
		// $node =  parent::initTargetNode();
		// return $node;
	// }	

	//----------------------------------------
	//Please Enter your code declaration here
	//----------------------------------------
	///@@@ parent view control
	// public function View(){	
		// igk_wln("view ".__CLASS__);	
		// parent::View();
	// }
	// public function initDb(){
	// 	$this->initDbFromSchemas();
	// }	
	
	// public function getimage($name){
	// 	return igk_html_uri(igk_io_basePath($this->getDataDir()."/R/Img/".$name));
	// }
	
	/*
	function buildPages($horizontalPane){
	    $data = IGKHtmlItem::CreateWebNode("horizontal-pane-data");
		
		$dir = $this->getArticlesDir()."/barner";
		IGKIO::CreateDir($dir);
		IGKIO::WriteToFile($dir."/.htaccess", "allow from all", false);
		
		foreach(igk_io_getfiles($this->getArticlesDir()."/barner", "/\.phtml$/i", false) as $k=>$v)
		{
			$p = $data->add("page");
			$s = igk_html_binddata($this,$p, $v,null);
		}
		$horizontalPane->loadData($data);
		$horizontalPane->Pane->AnimType = igk_getv($this->Configs, "clNavigationAnimType", "translation");
		$horizontalPane->Pane->AnimPeriod = igk_getv($this->Configs, "clNavigationAnimPeriod", "30000");		
		$horizontalPane->Pane->AnimDuration =  igk_getv($this->Configs, "clNavigationAnimDuration", "500");
		$horizontalPane->Pane->AnimInterval = igk_getv($this->Configs, "clNavigationAnimInterval", "20");		
		
	}
	public function getAddHorizontalPageUri(){
		return $this->getUri("add_new_navpage_ajx");
	}
	public function clearPagesUri(){
		return $this->getUri("clear_navpage_ajx");
	}
	public function getOptionsUri(){
		return $this->getUri("get_nav_options_ajx");
	}
	public function get_nav_options_ajx(){
		$pane = $this->getParam("igk:horizontalpane");
		if ($pane){
			igk_wl($pane->getOptionsXML($this->getUri("set_nav_option")));
		}		
	}
	public function set_nav_option(){
		$pane = $this->getParam("igk:horizontalpane");
		if (!$pane)
		{
			return;
		}
		$def = false;
		$p = igk_getr("menu");
		
		switch($p){
			case "option":
				$frame = igk_add_new_frame($this, "default_nav_options_frame");
				$frame->Title = R::ngets("title.options");
				$d = $frame->Content ;
				$d->ClearChilds();
				$frm = $d->addForm();
				$pane->EditPaneOptions($frm);				
				$frame->RenderAJX();
			break;
			case "setanimtype":
			$p = igk_getr("n");
			$pane->Pane->AnimType = $p;
			$this->Configs->clNavigationAnimType = $p;			
			$def= true;
			break;
		}
	
		//store config		
		//------------
		if ($def){
		$this->storeDBConfigsSetting();
		$pane->flush();		
		$pane->RenderAJX();
		}
	}
	
	function clear_navpage_ajx(){
		$tab = igk_io_getfiles($this->getArticlesDir()."/barner/", "/(.)/);
		foreach($tab as $k=>$v){
			if (is_file($v))
				unlink($v);
		}
		$pane = $this->getParam("igk:horizontalpane");
		$pane->clearPages();
		$pane->configure();
		$pane->flush();
		$pane->RenderAJX();
	}
	function add_new_navpage_ajx(){
	
	
		$tab = igk_get_allheaders();
		$pane = $this->getParam("igk:horizontalpane");
		
		
		if (igk_getr('ie', 0) == 1)
		{
			$pane->RenderAJX();
			igk_exit();
		}
		
		
		if (igk_getv($tab, "IGK_UPLOADFILE", false) ==false)
		{
			$s = IGKHtmlItem::CreateWebNode("script");
$s->Content = <<<EOF
ns_igk.winui.notify.showError("cant upload file IGK_UPLOADFILE not founds ");
EOF;
$s->RenderAJX();
$pane->RenderAJX();
			igk_exit();
		}
		$type = igk_getv($tab, "IGK_UP_FILE_TYPE","text/html");
		$fname = igk_getv($tab, "IGK_FILE_NAME", "file.data");
		$bfname = igk_io_basenamewithoutext($fname);
		$s = file_get_contents("php://input");
		
		if (!empty($s))
		{
		
			switch(strtolower($type ))
			{
				case "image/jpeg":
				case "image/jpg":
				case "image/png":
					igk_io_save_file_as_utf8_wbom($this->getArticlesDir()."/barner/".$fname, $s, true);
					$div=  IGKHtmlItem::CreateWebNode("div");
					$img =  $div->addImageNode();
					$img["src"] = igk_html_uri(igk_io_basePath($this->getArticlesDir()."/barner/".$fname));
					$img->setClass("fitw");
					igk_io_save_file_as_utf8_wbom($this->getArticlesDir()."/barner/".$bfname.".phtml", $div->Render(null) , true);
					break;
				default:
					igk_io_save_file_as_utf8_wbom($this->getArticlesDir()."/barner/".$bfname.".phtml", $s, true);				
				break;
			}
			$pane->clearPages();
			$pane->configure();
			$pane->flush();
			$pane->RenderAJX();
		}
	}*/
	//function
	// public function stayconnected(){
		// $o = igk_get_robj();
		// if (IGKValidator::IsEmail($o->clEmail ))
		// {
			// $d = igk_db_table_select_row("tbigk_mailinglists", $o, $this);
			
			// if (igk_db_table_select_row("tbigk_mailinglists", $o, $this) == null)
			// {
				// igk_db_insert($this, "tbigk_mailinglists", $o);
				// igk_notifyctrl("mailing:response")->addMsgr("mailupdated");
				
				// $this->send_notification_mail($o->clEmail);
				// igk_resetr();
			// }
			// else{
			
				// igk_notifyctrl("mailing:response")->addError("mail already present ...");
			// }		
		// }
		// else{
			// igk_notifyctrl("mailing:response")->addError("not a valid mail...");
		// }
		// $this->View();		
		// igk_navto(igk_io_baseuri()."#mailing_form");
		
	// }
	// public function confirm_mail(){
		// $q = base64_decode(igk_getr("q"));
		// igk_wln_e("confirm mail");
	// }
	// public function send_notification_mail($mail){
	
		// $doc = new IGKHtmlDoc($this->App, true);
		// $doc->ForMailTransport = true;
		
		// igk_html_article($this, "maillist_confirmation", $doc->Body->addDiv());		
		// $m = new IGKMail();		
		// $m->addTo($mail);
		// $m->HtmlMsg = $doc->Body->Render();
		// $m->Title = "Mail confirmation";
		// $m->ReplyTo = null;//$obj->clYourmail;
		// $m->From =  "no-reply@".$this->App->Configs->website_domain;
		// $m->sendMail();
	// }
}