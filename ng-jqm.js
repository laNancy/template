angular.module('kaifanla',[]).
controller('parentCtr',function($scope){
    $scope.jump = function(routPath){
        $.mobile.changePage(routPath,{'transition':'slide'});
    }

    //监听每个page的创建事件，只要DOM树新增加了元素，都会
    //重新编译连接，然后进入循环，从而使动态添加了元素生效
    $(document).on('pagecreate', function (event) {
        //监听到了page的创建
        console.log('page is creating....');
        //获取要加载到的容器
        var page = event.target;
        //获取作用域对象
        var scope = $(page).scope();
        //获取注入器对象
        var injector = $(page).injector();
        //调用注入器，为程序提供$compile服务
        injector.invoke(function($compile){
            //编译并链接DOM节点
            $compile(page)(scope);
            scope.$digest();
        });
    })

}).controller('mainCtr',function($scope,$http){
    $scope.hasMore = true;  //是否还有更多数据可供加载
    //控制器初始化/页面加载时，从服务器读取最前面的5条记录
    $http.get('../data/spot_getbypage.php?start=0').success(function(data){
        $scope.spotList = data;
    });
    $scope.loadMore = function(){
        $http.get('../data/spot_getbypage.php?start='+$scope.spotList.length).success(function(data){
            if(data.length<5){
                $scope.hasMore = false;
            }
            $scope.spotList = $scope.spotList.concat(data);
        });
    }
    //监视搜索框中的内容是否改变——监视 kw Model变量
    $scope.$watch('kw', function(){
        if( $scope.kw ){
            $http.get('../data/spot_getbykw.php?kw='+$scope.kw).success(function(data){
                $scope.spotList = data;
            })
        }
    })
    $scope.showDetail = function (sid) {
        console.log("spotId is "+sid);
        localStorage.setItem('sid',sid);
        $scope.jump('guid.html');
    }
}).controller('guidCtr',function($scope,$http){
    //读取路由URL中的参数
    //search for spotDetail
    $http.get('../data/spot_getbyid.php?id='+localStorage.getItem('sid')).
    success(function(data){
        $scope.spot = data[0];
    });
    //查找guid
    $http.get('../data/guid_get.php').
    success(function(data){
        $scope.guidList = data;
    });
   $scope.makeOrder=function(gid,gname){
       localStorage.setItem('gid',gid);
       localStorage.setItem('gname',gname);
       $scope.jump('order.html');
   }

}).controller('orderCtr',function($scope,$http,$rootScope){
    //定义order对象，用于保存order数据
    $scope.order = {
        "sid":localStorage.getItem('sid'),
        "gid":localStorage.getItem('gid'),
        "gname":localStorage.getItem('gname')
    };
    $scope.submitOrder = function(){
        $scope.order.arive_time=$scope.order.arive_time.getTime();

        var str = jQuery.param($scope.order);
        $http.get('../data/order_add.php?'+str).success(function(data){
            if(data[0].msg == 'succ'){
                $scope.succMsg = '下单成功！您的订单编号为：'+data[0].oid+'。您可以在用户中心查看订单状态。'
                $rootScope.phone = $scope.order.phone;//记载用户手机号，用于查询订单
            }else {
                $scope.errMsg = '下单失败！错误码为：'+data[0].reason;
            }
        })
    }
}).controller('myorderCtr',function($scope,$http,$rootScope){
    ($rootScope.phone)&&$http.get('../data/order_getbyphone.php?phone='+$rootScope.phone).success(function(data){
        $scope.orderList = data;
    });
    (!$rootScope.phone)&&$http.get('../data/order_get.php').success(function(data){
        $scope.orderList = data;
    });
})
