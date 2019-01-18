<?php

namespace app\admin\model;

use think\Model;

class Wechatuser extends Model
{
    // 表名
    protected $name = 'wechat_user';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = false;

    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = false;
    
    // 追加属性
    protected $append = [

    ];

    public function application()
    {
        return $this->hasOne('Application','wechat_user_id','id',[],'LEFT')->setEagerlyType(0);
    }
    

    







}
