/**
 * Created by zteliuyw on 15/5/28.
 */
$(function(){

    $("#search-input").keyup(function(){
        //$("#s-box").hide("slow");
        var text = $("#search-input").val().toLowerCase();
        //console.log(text);

        if(text =="" || text==undefined){
            $(".toc-link").show();
        }else{
            $(".toc-link").hide();
            $(".toc-link").each(function(){
                var htmlstr = $(this).html().toLowerCase();
				debugger;
                if(htmlstr.indexOf(text) != -1){
                    $(this).show();
                }
            })
        }


    })
})