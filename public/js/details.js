$(function(){
//获得从首页传来的商品id
//http://.../product_details.html?lid=5
//|              location              |
//                               |search|
//                                   |
//                              [?lid, 5 ]
//                                [0] [1]
if(location.search!==""){
//获得地址栏中的商品编号lid
var lid=location.search.split("=")[1];
$.ajax({//向服务端发送请求
  url:"http://localhost:3000/details",
  type:"get",
  data:{lid},//{lid:lid}用lid作为查询参数
  dataType:"json",
  success:function(result){
    //得到服务端返回的当前商品的详细信息
    console.log(result);
    //解构:
    var {product,specs,pics}=result;
    /*将基本信息放在页面右上角部分*/
    //查找title，并设置内容
    $("#details>h6:first")//第一个h6
    .html(product.title)//第一个h6
    .next()//第二个h6
    .html(`<a class="small text-dark font-weight-bold" href="javascript:;">${product.subtitle}</a>`)//第二个h6
    .next()//div
    .find("div>h2")//第一个子div下的h2
    .html("¥"+product.price.toFixed(2))
    //第一个子div下的h2
    .parent().next()//第二个子div
    .children().last()//第二个子div中最后一个span
    .html(product.promise);

    /*将规格列表添加到页面*/
    var html="";//准备空字符串拼接多个<a>
    //遍历specs数组中每个规格对象
    //specs:[ {spec对象}, {spec对象}, ...]
    for(var spec of specs){
      //spec对象:{lid:商品编号,spec:规格名}
      //每遍历一个规格对象就拼接一段<a>到html中
      html+=`<a class="btn btn-sm btn-outline-secondary ${spec.lid==lid?'active':''}" href="product_details.html?lid=${spec.lid}">${spec.spec}</a>`
    }
    //将HTML放入对应div中
    $("#details>div:eq(1)>div:eq(1)")
    .html(html);

    /*放大镜效果*/
    //1. 将获得的商品图片放到对应位置
    //所有图片的小图片应该放在底部的<ul>中
    //pics:[{图片对象},{图片对象},...]
    var html="";//定义空字符串准备累加<li>
    //遍历pics中每个图片对象
    for(var p of pics){
      //p:{lid:,sm:url,md:url,lg:url}
      html+=`<li class="float-left p-1">
        <img src="${p.sm}" data-md="${p.md}" data-lg="${p.lg}">
      </li>`
    }
    //将多个<li>的片段放入ul中
    var $ul=$("#preview>div>div:last ul")
    .html(html)
    //根据图片张数修改ul的宽
    .css({width:62*pics.length})
    //第一张图片的中图片应该放在上方的img中
    var $mImg=$("#preview>div>img")
    .attr({src:pics[0].md});
    //第一张图片的大图片应该放在隐藏的大div中
    var $divLg=$("#div-lg")
    .css({
      backgroundImage:`url(${pics[0].lg})`
    });
    //2. 点击左右按钮，让ul左右移动
    //查找两个按钮:
    var $btnLeft=
      $("#preview>div>div>img:first");
    var $btnRight=$btnLeft.next().next();
    //如果pics的图片张数<=4张
    if(pics.length<=4){
      //右边按钮禁用
      $btnRight.addClass("disabled")
    }
    var moved=0;//记录左移的次数
    //点击右边按钮，ul向左移动一次
    $btnRight.click(function(){
      //只有当前按钮不是.disabled
      if($(this).is(":not(.disabled)")){
        moved++;//左移的次数+1
        //设置ul的margin-left永远等于li的宽 -62*左移的次数moved
        $ul.css({marginLeft:-62*moved});
        //启用左边按钮
        $btnLeft.removeClass("disabled");
        //如果左移的张数+4张刚好==图片总数
        if(moved+4==pics.length){
          //禁用右边按钮
          $(this).addClass("disabled")
        }
      }
    })
    //点击左边按钮，ul向右移动一次
    $btnLeft.click(function(){
      //只有当前按钮不是.disabled
      if($(this).is(":not(.disabled)")){
        moved--;//左移的次数-1
        $ul.css({marginLeft:-62*moved})
        $btnRight.removeClass("disabled");
        if(moved==0){
          $(this).addClass("disabled")
        }
      }
    })
    //3. 鼠标移入小图片img，切换中图片和大图片
    //利用冒泡：事件绑定在$ul上，只允许img元素触发事件
    $ul.on("mouseenter","li>img",function(){
      var $img=$(this);//获得当前img
      //获取当前img上的data-md属性
      var src=$img.attr("data-md");
      $mImg.attr({src});//修改中图片的src
      //获取当前img上的data-lg属性
      var backgroundImage=
        `url(${$img.attr("data-lg")})`;
      //修改大图片的backgroundImage
      $divLg.css({backgroundImage});
    })
    //4. 鼠标进入superMask，显示遮罩层和大图片
    //   鼠标移出superMask，隐藏遮罩层和大图片
    var $mask=$("#mask");
    var $smask=$("#super-mask");
    var max=176;//superMask352-mask176
    $smask
    /*.mouseenter(function(){
      $mask.removeClass("d-none");
      $divLg.removeClass("d-none");
    })
    .mouseleave(function(){
      $mask.addClass("d-none");
      $divLg.addClass("d-none");
    })*/
    /*.hover(
      function(){
        $mask.removeClass("d-none");
        $divLg.removeClass("d-none");
      },
      function(){
        $mask.addClass("d-none");
        $divLg.addClass("d-none");
      }
    )*/
    .hover(function(){
      $mask.toggleClass("d-none");
      $divLg.toggleClass("d-none");
    })
    //5. mask跟随鼠标移动，并同步移动大div的背景图片位置
    .mousemove(function(e){
      var left=e.offsetX-88;
      var top=e.offsetY-88;
      if(left<0) left=0;
      else if(left>max) left=max;
      if(top<0) top=0;
      else if(top>max) top=max;
      $mask.css({left,top});
      var backgroundPosition=
        `${-16/7*left}px ${-16/7*top}px`;
      $divLg.css({backgroundPosition});
    })
  }
})
}//在product_details.html中右键live server运行，在地址栏后补充?lid=5，打开控制台
})