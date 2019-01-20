<?php

namespace app\admin\controller\activity;

use app\common\controller\Backend;

use app\admin\model\Wechatuser;
use think\Config;

/**
 * 报名管理
 *
 * @icon fa fa-circle-o
 */
class Application extends Backend
{
    
    /**
     * Application模型对象
     * @var \app\common\model\Application
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = new \app\admin\model\Application;

    }
    
    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个基础方法、destroy/restore/recyclebin三个回收站方法
     * 因此在当前控制器中可不用编写增删改查的代码,除非需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */

    /**
    * 通过CURL发送数据
    * @param $url 请求的URL地址
    * @param $data 发送的数据
    * return 请求结果
    */
    protected function curlPost($url,$data)
    {
        $ch = curl_init();
        $params[CURLOPT_URL] = $url;    //请求url地址
        $params[CURLOPT_HEADER] = FALSE; //是否返回响应头信息
        $params[CURLOPT_SSL_VERIFYPEER] = false;
	    $params[CURLOPT_SSL_VERIFYHOST] = false;
        $params[CURLOPT_RETURNTRANSFER] = true; //是否将结果返回
        $params[CURLOPT_POST] = true;
        $params[CURLOPT_POSTFIELDS] = $data;
        curl_setopt_array($ch, $params); //传入curl参数
        $content = curl_exec($ch); //执行
        curl_close($ch); //关闭连接
        return $content;
    }
    
    /**
    * 这里获取accesstoken
    */
    public function getAccessToken()
    {
        $file = RUNTIME_PATH . '/access_token';//缓存文件名access_token
        $appid = Config::get('oauth')['appid']; // 填写自己的appid
        $secret = Config::get('oauth')['appsecret']; // 填写自己的appsecret
        $expires = 3600;//缓存时间1个小时
        if (file_exists($file)) {
            $time = filemtime($file);
            if (time() - $time > $expires) {
                $token = null;
            } else {
                $token = file_get_contents($file);
            }
        } else {
            fopen("$file", "w+");
            $token = null;
        }
        if (!$token || strlen($token) < 6) {
            $res = file_get_contents("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" . $appid . "&secret=" . $secret . "");

            $res = json_decode($res, true);
            $token = $res['access_token'];
            pr($res);
            die;
            @file_put_contents($file, $token);
        }
        
        return $token;

    }


    /**
     * 发送中奖信息
     * 微信模板消息发送
     * @param $openid 接收用户的openid
     * return 发送结果
     */
    public function prize($id = "")
    {
        $application = $this->model->where('id', $id)->find();
        $wechat = collection(Wechatuser::where('id', $appliaction['wechat_user_id'])->select())->toArray();
        $tokens = $this->getAccessToken();
        pr($tokens);
        die;
        //请求模板消息的地址
        $url = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' . $tokens;
        $params = [
            'touser' => "onGgow5p2M5H2g8EouDYxB4K40PQ",
            'template_id' => 'Oblr5uXH_fS79gMC8E0mYz0CpUAHnJtdvAC3PWABrsk',//模板ID
            'url' => '', //点击详情后的URL可以动态定义
            'data' => 
                    [
                      'first' => 
                         [
                            'value' => '您好!有访客访给您留言了。',
                            'color' => '#173177'
                         ],
                      'user' => 
                         [
                            'value' => '张三',
                            'color' => '#FF0000'
                         ],
 
                      'ask' => 
                         [
                                'value' => '您好,非常关注黎明互联,有没有关于支付宝的视频教程?',
                                'color' => '#173177'
                         ],
                       'remark' => 
                         [
                                'value' => '该用户已注册12天',
                                'color' => 'blue'
                         ] 
                      ]
        ]; 
        $json = json_encode($params,JSON_UNESCAPED_UNICODE);

        return $this->curlPost($url, $json);

    }

    
}
 
