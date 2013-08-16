$(function(){
    var data = {a:"<script>alert(1)</script>",
                b:true,
                isb:"b is true",
                isnotb: "b is not true",
                c: [1,2,3].join('\n')
               };
    $('body')
        .tmpl('tmpl1', data)
        .tmplAppend('tmpl2', {});
})
