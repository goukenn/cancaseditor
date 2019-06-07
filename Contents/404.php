<?php

// igk_wln_e("tracing: ", igk_show_trace());
/*/
$t = igk_createNode("div");
$t->clearChilds();
$t["class"] = "google-Roboto";
$t->addDiv()->addSectionTitle(4)->Content = "ERROR - 404 - ".get_class($this);

$t->addDiv()->addObData(function(){
?>
<div>
-------It looks like nothing was found at this location. Maybe try a search?--------
</div>
<?php
if (!igk_sys_env_production())
	igk_wl(igk_show_trace());

});

$d = igk_get_document(__FILE__);
igk_google_addFont($d , "Roboto", 400);
$d->Title = "Oups!!! - 404 ";
$d->body->addBodyBox()->clearChilds()->add($t);
$t->addDiv()->Content = (new  IGKHtmlRelativeUriValueAttribute("/R/Styles/balafon.css"))->getValue();
$d->RenderAJX();
$d->dispose();

*/
igk_wln("done");
igk_exit(); 