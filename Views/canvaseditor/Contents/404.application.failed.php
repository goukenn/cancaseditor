<div>
	<div class="igk-title-4" style="font-size:4em" >Oops!</div>
	<?php
	//igk_wl(igk_html_ob(function(){
		$col = igk_createNode("col");
		
		$col->addDiv()->Content =igk_str_format(R::gets(<<<'EIF'
It seem we can't provide '{0|uppercase}' application for your Browser. Please upgrade your browser to recent version.
EIF
), CE_APP_LABEL);
		
		$col->addDiv()->Content = R::gets("Error : 404");		
		$col->addDiv()->add('em')->Content = IGKUserAgent::Agent();
		$col->RenderAJX();
	//}));
?>
</div>