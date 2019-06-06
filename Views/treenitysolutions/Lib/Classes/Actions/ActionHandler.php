<?php


namespace  treenitySolutions\Actions;


class ActionHandler extends \IGKViewActionHandler {
	private static $sm_instance;
	
	private $ctrl;
	
	///.get instance
	public static function getInstance($ctrl=null){
		if (!self::$sm_instance){
			self::$sm_instance = new ActionHandler();
			self::$sm_instance->ctrl = $ctrl;
		}
		return self::$sm_instance ;
	}
	
	///.ctr
	private function __construct(){
	}
	
	
	public function question(){
		if(igk_qr_confirm()){
			
		}
	}
	
	
}