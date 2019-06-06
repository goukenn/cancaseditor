<?php


namespace sfia;
use \R as R;

class sfiaPresentation{
	
	
	public static function ShowList($ctrl, $tab, $o, $Utils){
		
$tab->setClass("sfia-list");

	$tr = $tab->add("tr");
	$tr->add("td")->Content = R::gets("Name");
	$tr->add("td")->Content = R::gets("Code"); 
	$tr->add("td")->Content = R::gets("Min Level"); 
	$tr->add("td")->Content = R::gets("Max Level"); 
	$tr->add("td")->Content = R::gets("Parent"); 
$rootParent = array();
foreach($o as $k=>$m){
	// if (!igk_sys_env_production())
	// if ($m->clParent)// != null ) && empty($m->clParent))
		// continue;
	
	$tr = $tab->add("tr");
	
	
	if ($m->clParent)
	{
		if (!isset($rootParent[$m->clParent])){
			$rootParent[$m->clParent] = $Utils->getRootParent($m->clParent);
		}
		
		$tr["class"] = $rootParent[$m->clParent]->clClass;
	}else{
		$tr["class"] = $m->clClass;
	}
	$td = $tr->add("td");
	
	if (!igk_sys_env_production())
		$td = $td->addAJXA($entryuri."/edit/".$m->clId);
	$td->Content = stripslashes( $m->clName);
	//$tr->add("td")->addAJXA($entryuri."/edit/".$m->clId)->Content = stripslashes( $m->clName);
	$tr->add("td")->Content = $m->clCode;
	$tr->add("td")->Content = $m->clMinLevel;
	$tr->add("td")->Content = $m->clMaxLevel;
	$tr->add("td")->Content = $m->clParent;

}


}
}