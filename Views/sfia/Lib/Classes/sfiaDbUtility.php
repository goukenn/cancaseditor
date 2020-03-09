<?php

namespace sfia;

use \IGKDbUtility as IGKDbUtility;

class sfiaDbUtility extends IGKDbUtility{
	private $m_ad;
	private $m_litedb;
	private $m_tabinfo;
	private $m_schema;
	
	public function __construct($app, $ad, $litedb,  $schema){
		parent::__construct($app);
		$this->setAd($ad);
		$this->m_ad = $ad;
		$this->m_litedb = $litedb;
		$this->m_schema = $schema; 
	}
	public function connect(){;
		$this->setAd($this->m_ad);
		return $this->m_ad->connect($this->m_litedb);
	}
	protected function initDataAdapter(){
		$this->setAd($this->m_ad);
		return  $this->m_ad;
	}

	public function getGroupsParent($name){
		$this->select("tbsfia_groups", array("clName"=>$name));
	}
	public function getGroupByName($name){
		return $this->adCallback(function($db)use($name){
			return $this->selectSingleRow("tbsfia_groups", array("clName"=>$name));
		});
	}
	public function getGroupById($id){
		return $this->adCallback(function($db)use($id){
			return $this->selectSingleRow("tbsfia_groups", $id); // array("clId"=>$name));
		});
	}
	public function addGroup($r){
		return $this->adCallback(function()use($r){
			return $this->insert("tbsfia_groups", $r);
		});
	}
	public function getRootGroups($excludeid=null){
		$e =  $this->adCallback(function()use($excludeid){
			//igk_wln("count : ".get_class($this->Ad));
			$f =  array();//"clParent"=>null);
			if ($excludeid){
				$f["!clId"] = $excludeid;
			}
			
			return $this->select("tbsfia_groups",$f);
		});
		
		return $e;
	}
	public function getGroups(){
		$e =  $this->adCallback(function(){
			return $this->select("tbsfia_groups");
		});		
		return $e; //Rows;
	}
	public function isSubCategory($row){
		return $row->clParent !== null;
	}
	public function isCategory($row){
		return $row->clParent ===null;
	}
	
	public function updateGroup($row){
		$e =  $this->adCallback(function()use($row){
			return $this->update("tbsfia_groups", $row, null, $this->getTableInfo("tbsfia_groups"));
		});		
		return $e;
	}
	public function getTableInfo($tbname=null){
		if ($this->m_tabinfo==null){
			$this->m_tabinfo = (file_exists($this->m_schema) ?
			 igk_db_load_data_and_entries_schemas($this->m_schema) : null)
			 ?? igk_die("failed to create table info : ".__METHOD__); 
		} 
		if ($tbname){
			$key = "::infokey";
			if (!isset($this->m_tabinfo->$key)){
				$this->m_tabinfo->$key = igk_createobj();
			}
			if (!isset($this->m_tabinfo->$key->$tbname))
			{
				$this->m_tabinfo->$key->$tbname = igk_db_column_info($this->m_tabinfo, $tbname);
			}
			return $this->m_tabinfo->$key->$tbname;
		}
		return $this->m_tabinfo;
	}
	///<summary> get root parent</summary>
	public function getRootParent($pid){
		return $this->adCallback(function()use($pid){
			$sid = $pid;
			$r = null;
			while($sid){
				$r = $this->getGroupById($sid);
				if ($r && $r->clParent)
					$sid = $r->clParent;
				else 
					$sid = null;
			}
			return $r;
		});
	}
}
