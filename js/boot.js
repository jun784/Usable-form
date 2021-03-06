$(function(){

  formAction.checkPattern();
  formAction.checkAllFieldFilled();
  formAction.emailImitater();
  formAction.creditcardField();
  formAction.kanjiConverter();
  formAction.zipConverter();
  formAction.datePicker();
  
});


formAction = function (){};

// 必須入力項目の入力チェック
formAction.checkPattern = function(){
  
  $('[required]').on('keyup change', function(e){
    
    // 例外としてcheckConfirmPassword()
    if ($(this).attr("id") == "accoumt_password_confirm"){
      var original = $('#accoumt_password');
      checkConfirmPassword(original, $(this));
      //formAction.checkAllFieldFilled();
      return;
    }
    
    // 通常はcheckhoge()
    if (e.type == "keyup") checkInput($(this));
    if (e.type == "change") checkSelect($(this));
    //formAction.checkAllFieldFilled();

  });
  
  $('.required input[type="radio"]:radio').on('click onkeypress', function (e){
    
    checkRadio($(this));
    //formAction.checkAllFieldFilled();

  });

  $('.required input[type="checkbox"]:checkbox').on('click onkeypress', function (){
    
    checkCheckbox($(this));
    //formAction.checkAllFieldFilled();

  });

  // 入力チェック pattern属性があればtest()、なければ無条件OK
  var checkInput = function (elm){
    
    if (checkAttr(elm, "pattern")){
      var regex = new RegExp ("^"+elm.attr("pattern")+"$");
      if (regex.test(elm.val()) == true){
        setStatus(elm, "dealed");
      } else if(elm.val() == ""){
        setStatus(elm, "alert");
      } else{
        setStatus(elm, "caution");
      }
    } else{
      if (elm.val() != ""){
        setStatus(elm, "dealed");
      }
    }

  };

  var checkSelect = function (elm){
    setStatus(elm, "dealed");
  };
  
  var checkRadio = function (elm){
    setStatus(elm.parents(".required"), "dealed");
  };

  var checkCheckbox = function (elm){
    setStatus(elm.parents(".required"), "dealed");
  };

  // パスワードが入力されたものと一致するか検証
  var checkConfirmPassword = function(original, confirm){
    
    if (confirm.val() == original.val()){
      setStatus(confirm, "dealed");
    } else if (confirm.val() == ""){
      setStatus(confirm, "alert");
    } else{
      setStatus(confirm, "caution");
    }
    
  };

};

// 必須入力項目が全て入力されているか確認して送信ボタンの有効/無効を切り替える
formAction.checkAllFieldFilled = function(){
  
  $("#submit").attr("disabled", "disabled");

  if (
      ($("[required]").length == $("[required].dealed").length) &&
      ($(".required").length == $(".required.dealed").length)
      ){
    $("#submit").removeAttr("disabled");
  }

};

// 確認用メールアドレスをインクリメンタルコピペ
formAction.emailImitater = function(){

  $('#email').on('keyup', function(){

    $("#email_confirm").parent().parent().removeClass("hide");
    $("#email_confirm").text($(this).val());

  });

};

// クレジットカード番号のフォーマット
formAction.creditcardField = function(){
  
  $("#creditcard").hide();
  $("#paymentMethod input:radio").on('click onkeypress', function(){
    if ($(this).val() == "option1"){
      $("#creditcard").show();
    } else{
      $("#creditcard").hide();
    }
  });

  $('.cc-number').payment('formatCardNumber');
  $('.cc-exp').payment('formatCardExpiry');
  $('.cc-sec').payment('formatCardCVC');
  $('[data-numeric]').payment('restrictNumeric');
  
  $('.cc-number').on('keyup', function(){
    var cardtype = $.payment.cardType($(this).val());
    if (cardtype){
      $(this).attr("data-cardtype", cardtype);
      $(this).css("background-image", 'url("img/card_'+ cardtype +'.png")');
    }
    
  });

  $('.cc-sec').on("focus focusout", function(){
    $(this).popover({
    html: true,
    placement: "top",
    trigger: "manual",
    title: "記載場所",
    content: (($("#cc_number").attr("data-cardtype") == "amex") ? '<img src="./img/securitycode_amex.png" width="185" height="126" style="max-width: 100%;"><p>セキュリティコードはカード表面の番号右上に記載の数字4桁になります</p>' : '<img src="./img/securitycode_visa.png" width="185" height="126" style="max-width: 100%;"><p>セキュリティコードはカード裏面の署名欄に記載の数字末尾3桁になります</p>')
    }).popover("toggle");
  });

};


// 郵便番号入力後に住所に自動変換
formAction.zipConverter = function(){

  $('#zip').on('keyup', function(){

    AjaxZip2.zip2addr(this, pref, town);

  });

};

// 漢字 => よみがな変換
formAction.kanjiConverter = function(){

  var names = {
    kanji_family: "name_kanji_family",
    kanji_given : "name_kanji_given",
    yomi_family : "name_kana_family",
    yomi_given  : "name_kana_given"
  };


  // テキスト内容が変更されたらAPIに投げる
  $("#"+names["kanji_family"]+", #"+names["kanji_given"]).on("change", function(){
    
    var id = $(this).attr("id");

    $.ajax({
      url : "http://www.social-ime.com/api/",
      type: "GET",
      data: {
        string : $(this).val()
      },
      success: function(data){
        var yomis = $(data.responseText).text().trim().split(" ");
        var yomi  = substituteYomi(yomis);
        // 対応する欄に値を入れる
        if (id == names["kanji_family"]){
          var elm = $("#"+names["yomi_family"]);
        } else if (id == names["kanji_given"]){
          var elm = $("#"+names["yomi_given"]);
        }
        elm.val(yomi);
        setStatus(elm, "dealed");
        return;
      }
    });

    // 配列からカタカナのみで構成された文字列を返す
    function substituteYomi(yomis){

      for (var i=0; i<yomis.length; i++){
        if (/^[ァ-ン]*$/.test(yomis[i]) == true){
          return yomis[i];
        }
      }

    }

  });
  
};

// カレンダー呼び出し
formAction.datePicker = function(){

  $.datepicker.setDefaults($.datepicker.regional["ja"]);
  $("#datepicker").datepicker({
    "dateFormat": "yy/mm/dd",
    "defaultDate": 2,
    "firstDay": 1,
    "minDate": 1, 
    "maxDate": 30
  });

};

// 内部関数：要素にステータスクラスを設定
function setStatus(elm, status){

  elm.removeClass("alert caution dealed");
  elm.addClass(status);
  return;

};

// 内部関数：属性存在確認
function checkAttr(elm, attr){

  return (typeof elm.attr(attr) !== 'undefined' && elm.attr(attr) !== false) ? true : false;

}