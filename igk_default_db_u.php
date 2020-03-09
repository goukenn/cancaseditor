<?php


///<summary>represent db utility</summary>
final class igk_default_db_u extends IGKDbUtility{
	
	function __construct($app){
		parent::__construct($app);
	}
	function getWhoUse(){
		return $this->select(IGK_TB_WHO_USES);
	}
}