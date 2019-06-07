<?php
function igk_utest_unserialize_igkdcssdefaultstyle(){
$b = <<<EOF
C:18:"IGKCssDefaultStyle":85:{a:1:{i:0;a:1:{s:22:".igk-media-type:before";s:31:"z-index:-9999; content:'global'";}}}
EOF;
$g = unserialize($b);
igk_wln($g);
}

?>