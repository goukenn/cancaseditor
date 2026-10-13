<?php
// @author: C.A.D. BONDJE DOUE
// @file: Surfaces.php
// @desc: surfaces (cancasEditor documents) saved on the account of a connected user. The name of a surface is a
// path: "/" builds directories (a/b/c). A user owns a limited number of surfaces (10 by default, more for some
// profiles); each surface is private, shared with other users (read only) or public.
namespace Com\IGKDEV\App\CancasEditor;

use igk_default\Models\CancasSurfaces;
use igk_default\Models\CancasSurfaceShares;
use igk_default\Profiles;

class Surfaces
{
    const DEFAULT_QUOTA = 10;
    /** quota by profile: the highest one of the profiles of the user applies */
    const PROFILE_QUOTA = [
        Profiles::ADMIN => 100,
        Profiles::WEBDESIGNER => 25,
    ];
    const MAX_CONTENT = 8388608; // 8 MB
    const MAX_NAME = 255;
    const MAX_DEPTH = 8;
    const VISIBILITIES = ['private', 'public'];

    /** @return string|null the name without surrounding spaces / slashes, null when invalid */
    public static function cleanName($name)
    {
        $name = trim((string)$name);
        $name = trim($name, "/ \t");
        if ($name === '' || strlen($name) > self::MAX_NAME) {
            return null;
        }
        $parts = explode('/', $name);
        if (count($parts) > self::MAX_DEPTH) {
            return null;
        }
        foreach ($parts as $p) {
            $p = trim($p);
            // no empty segment (a//b), no . or .., no control character or backslash
            if ($p === '' || $p === '.' || $p === '..' || preg_match('/[\x00-\x1f\\\\]/', $p)) {
                return null;
            }
        }
        return implode('/', array_map('trim', $parts));
    }

    public static function quota($me)
    {
        $q = self::DEFAULT_QUOTA;
        foreach (self::PROFILE_QUOTA as $profile => $n) {
            try {
                if ($me->auth($profile) && $n > $q) {
                    $q = $n;
                }
            } catch (\Throwable $e) {
                // an unknown profile does not grant anything
            }
        }
        return $q;
    }

    private static function login($guid)
    {
        static $cache = [];
        if (!isset($cache[$guid])) {
            $u = \IGK\Models\Users::select_row(["clGuid" => $guid]);
            $cache[$guid] = $u ? $u->clLogin : '';
        }
        return $cache[$guid];
    }

    private static function item($r, $me, $withShares = false)
    {
        $o = [
            "id" => (int)$r->{CancasSurfaces::FD_ID},
            "name" => $r->{CancasSurfaces::FD_NAME},
            "visibility" => $r->{CancasSurfaces::FD_VISIBILITY},
            "updated" => $r->{CancasSurfaces::FD_UPDATE_AT},
            "owner" => self::login($r->{CancasSurfaces::FD_OWNER}),
            "mine" => $r->{CancasSurfaces::FD_OWNER} === $me->clGuid,
        ];
        if ($withShares) {
            $o["shared"] = [];
            foreach (CancasSurfaceShares::select_all([CancasSurfaceShares::FD_SURFACE => $o["id"]]) ?: [] as $s) {
                $o["shared"][] = self::login($s->{CancasSurfaceShares::FD_USER});
            }
        }
        return $o;
    }

    /** the surfaces of the user, the ones shared with the user and the public ones of the others (without content) */
    public static function listAll($me)
    {
        $mine = $shared = $public = [];
        $mineRows = CancasSurfaces::select_all([CancasSurfaces::FD_OWNER => $me->clGuid]) ?: [];
        foreach ($mineRows as $r) {
            $mine[] = self::item($r, $me, true);
        }
        $seen = [];
        foreach (CancasSurfaceShares::select_all([CancasSurfaceShares::FD_USER => $me->clGuid]) ?: [] as $s) {
            $r = CancasSurfaces::select_row([CancasSurfaces::FD_ID => $s->{CancasSurfaceShares::FD_SURFACE}]);
            if ($r) {
                $seen[$r->{CancasSurfaces::FD_ID}] = 1;
                $shared[] = self::item($r, $me);
            }
        }
        foreach (CancasSurfaces::select_all([CancasSurfaces::FD_VISIBILITY => 'public']) ?: [] as $r) {
            if ($r->{CancasSurfaces::FD_OWNER} !== $me->clGuid && !isset($seen[$r->{CancasSurfaces::FD_ID}])) {
                $public[] = self::item($r, $me);
            }
        }
        return ["quota" => self::quota($me), "used" => count($mine), "mine" => $mine, "shared" => $shared, "public" => $public];
    }

    /** the surface when the user can read it (owner, shared with or public) */
    public static function readable($me, $id)
    {
        $r = CancasSurfaces::select_row([CancasSurfaces::FD_ID => (int)$id]);
        if (!$r) {
            return null;
        }
        if ($r->{CancasSurfaces::FD_OWNER} === $me->clGuid || $r->{CancasSurfaces::FD_VISIBILITY} === 'public') {
            return $r;
        }
        $s = CancasSurfaceShares::select_row([CancasSurfaceShares::FD_SURFACE => (int)$id, CancasSurfaceShares::FD_USER => $me->clGuid]);
        return $s ? $r : null;
    }

    public static function owned($me, $id)
    {
        return CancasSurfaces::select_row([CancasSurfaces::FD_ID => (int)$id, CancasSurfaces::FD_OWNER => $me->clGuid]) ?: null;
    }

    /**
     * create or replace (same name) a surface of the user
     * @return array ["ok"=>true,"id"=>int] | ["error"=>code]
     */
    public static function save($me, $name, $content)
    {
        $name = self::cleanName($name);
        if ($name === null) {
            return ["error" => "invalid name"];
        }
        $content = (string)$content;
        if (strlen($content) > self::MAX_CONTENT) {
            return ["error" => "too large"];
        }
        if (strpos($content, '<gkds') === false) {
            return ["error" => "invalid content"];
        }
        $cond = [CancasSurfaces::FD_OWNER => $me->clGuid, CancasSurfaces::FD_NAME => $name];
        $r = CancasSurfaces::select_row($cond);
        if ($r) {
            CancasSurfaces::update([CancasSurfaces::FD_CONTENT => $content], $cond);
            return ["ok" => true, "id" => (int)$r->{CancasSurfaces::FD_ID}, "name" => $name];
        }
        if (CancasSurfaces::count([CancasSurfaces::FD_OWNER => $me->clGuid]) >= self::quota($me)) {
            return ["error" => "quota", "quota" => self::quota($me)];
        }
        $item = CancasSurfaces::Insert(["name" => $name, "content" => $content, "visibility" => "private", "owner" => $me->clGuid]);
        return $item ? ["ok" => true, "id" => (int)$item->{CancasSurfaces::FD_ID}, "name" => $name] : ["error" => "failed"];
    }

    public static function rename($me, $id, $name)
    {
        $r = self::owned($me, $id);
        $name = self::cleanName($name);
        if (!$r || $name === null) {
            return ["error" => $r ? "invalid name" : "not found"];
        }
        $other = CancasSurfaces::select_row([CancasSurfaces::FD_OWNER => $me->clGuid, CancasSurfaces::FD_NAME => $name]);
        if ($other && (int)$other->{CancasSurfaces::FD_ID} !== (int)$id) {
            return ["error" => "exists"];
        }
        CancasSurfaces::update([CancasSurfaces::FD_NAME => $name], [CancasSurfaces::FD_ID => (int)$id]);
        return ["ok" => true, "name" => $name];
    }

    public static function delete($me, $id)
    {
        if (!self::owned($me, $id)) {
            return ["error" => "not found"];
        }
        CancasSurfaceShares::delete([CancasSurfaceShares::FD_SURFACE => (int)$id]);
        CancasSurfaces::delete([CancasSurfaces::FD_ID => (int)$id]);
        return ["ok" => true];
    }

    public static function setVisibility($me, $id, $v)
    {
        if (!self::owned($me, $id) || !in_array($v, self::VISIBILITIES, true)) {
            return ["error" => "invalid"];
        }
        CancasSurfaces::update([CancasSurfaces::FD_VISIBILITY => $v], [CancasSurfaces::FD_ID => (int)$id]);
        return ["ok" => true, "visibility" => $v];
    }

    /** share with (or stop sharing with) the user of a login */
    public static function share($me, $id, $login, $on)
    {
        if (!self::owned($me, $id)) {
            return ["error" => "not found"];
        }
        $u = \IGK\Models\Users::select_row(["clLogin" => trim((string)$login)]);
        if (!$u || $u->clGuid === $me->clGuid) {
            return ["error" => "unknown user"];
        }
        $cond = [CancasSurfaceShares::FD_SURFACE => (int)$id, CancasSurfaceShares::FD_USER => $u->clGuid];
        $has = CancasSurfaceShares::select_row($cond);
        if ($on && !$has) {
            CancasSurfaceShares::Insert(["surface" => (int)$id, "user" => $u->clGuid]);
        } elseif (!$on && $has) {
            CancasSurfaceShares::delete($cond);
        }
        return ["ok" => true];
    }
}
