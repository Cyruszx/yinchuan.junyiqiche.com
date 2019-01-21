define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'activity/application/index',
                    // add_url: 'activity/application/add',
                    edit_url: 'activity/application/edit',
                    del_url: 'activity/application/del',
                    multi_url: 'activity/application/multi',
                    table: 'application',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'votes',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'name', title: __('Name')},
                        {field: 'model', title: __('Model')},
                        {field: 'daily_running_water', title: __('Daily_running_water'), operate:'BETWEEN'},
                        {field: 'service_points', title: __('Service_points')},
                        {field: 'applicationimages', title: __('Applicationimages'), formatter: Controller.api.formatter.images},
                        {field: 'votes', title: __('Votes')},
                        {field: 'ranking', title: __('排名')},
                        {field: 'operate', title: __('Operate'), table: table,
                        buttons: [
                            /**
                             * 删除按钮
                             */
                            {
                                icon: 'fa fa-trash', 
                                name: 'del', 
                                text: '删除', 
                                extend: 'data-toggle="tooltip"', 
                                title: __('Del'), 
                                classname: 'btn btn-xs btn-danger btn-delone',
                               
                            },

                            /**
                             * 编辑按钮
                             */
                            {
                                name: 'edit', 
                                text: '编辑', 
                                icon: 'fa fa-pencil', 
                                extend: 'data-toggle="tooltip"',
                                title: __('编辑'), 
                                classname: 'btn btn-xs btn-success btn-editone',
                                       
                            },

                            /**
                             * 发送中奖信息
                             */
                            {
                                name: 'prize', 
                                text: '发送中奖信息',
                                classname: 'btn btn-xs btn-success btn-prize',
                                icon: 'fa fa-share', 
                                title: __('发送中奖信息'), 
                                extend: 'data-toggle="tooltip"', 
                                hidden: function (row) {  

                                    if (row.label) {
                                        return false;
                                    }
                                    else if (!row.label) {
                                        return true;
                                    }
                                },
                                    
                            },
                        ], 
                        events: Controller.api.events.operate, formatter: Controller.api.formatter.operate}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },
            events: {
                operate: {

                    /**
                     * 发送中奖信息
                     * @param e
                     * @param value
                     * @param row
                     * @param index
                     */
                    'click .btn-prize': function (e, value, row, index) {

                        e.stopPropagation();
                        e.preventDefault();
                        var that = this;
                        var top = $(that).offset().top - $(window).scrollTop();
                        var left = $(that).offset().left - $(window).scrollLeft() - 260;
                        if (top + 154 > $(window).height()) {
                            top = top - 154;
                        }
                        if ($(window).width() < 480) {
                            top = left = undefined;
                        }
                        Layer.confirm(
                            __('确认发送中奖信息?'),
                            { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },

                            function (index) {
                                var table = $(that).closest('table');
                                var options = table.bootstrapTable('getOptions');


                                Fast.api.ajax({

                                    url: 'activity/application/prize',
                                    data: {row: row}
 
                                }, function (data, ret) {

                                    Toastr.success('操作成功');
                                    Layer.close(index);
                                    table.bootstrapTable('refresh');
                                    return false;
                                }, function (data, ret) {
                                    //失败的回调
                                    Toastr.success(ret.msg);

                                    return false;
                                });


                            }
                        );

                    },

                    /**
                     * 编辑按钮
                     * @param e
                     * @param value
                     * @param row
                     * @param index
                     */
                    'click .btn-editone': function (e, value, row, index) { /**编辑按钮 */

                        e.stopPropagation();
                        e.preventDefault();
                        var table = $(this).closest('table');
                        var options = table.bootstrapTable('getOptions');
                        var ids = row[options.pk];
                        row = $.extend({}, row ? row : {}, { ids: ids });
                        var url = options.extend.edit_url+'/posttype/edit';
                        Fast.api.open(Table.api.replaceurl(url, row, table), __('Edit'), $(this).data() || {});
                    },

                
                    /**
                     * 删除按钮
                     * @param e
                     * @param value
                     * @param row
                     * @param index
                     */
                    'click .btn-delone': function (e, value, row, index) {  /**删除按钮 */

                        e.stopPropagation();
                        e.preventDefault();
                        var that = this;
                        var top = $(that).offset().top - $(window).scrollTop();
                        var left = $(that).offset().left - $(window).scrollLeft() - 260;
                        if (top + 154 > $(window).height()) {
                            top = top - 154;
                        }
                        if ($(window).width() < 480) {
                            top = left = undefined;
                        }
                        Layer.confirm(
                            __('Are you sure you want to delete this item?'),
                            { icon: 3, title: __('Warning'), offset: [top, left], shadeClose: true },
                            function (index) {
                                var table = $(that).closest('table');
                                var options = table.bootstrapTable('getOptions');
                                Table.api.multi("del", row[options.pk], table, that);
                                Layer.close(index);
                            }
                        );
                    },
                }
            },
            formatter: {
                operate: function (value, row, index) {
                    var table = this.table;
                    // 操作配置
                    var options = table ? table.bootstrapTable('getOptions') : {};
                    // 默认按钮组
                    var buttons = $.extend([], this.buttons || []);

                    return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                },
                images: function (value, row, index) {
                    value = value === null ? '' : value.toString();
                    var classname = typeof this.classname !== 'undefined' ? this.classname : 'img-sm img-center';
                    var arr = value.split(',');
                    var html = [];
                    $.each(arr, function (i, value) {
                        value = value ? value : '/assets/img/blank.gif';
                        html.push('<a href="' + 'https://yinchuan.junyiqiche.com' + value + '" target="_blank"><img class="' + classname + '" src="' + 'https://yinchuan.junyiqiche.com' + value + '" /></a>');
                    });
                    return html.join(' ');
                },
            }
        }
    };
    return Controller;
});