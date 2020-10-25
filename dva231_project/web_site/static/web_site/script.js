$( document ).ready(function() {

    $('#scroll-up').on('click', function(){
        $("html, body").animate({scrollTop: 0}, 1000);
    });

    $('#show-reviews-btn').on('click', function(){
        $('#reviews-container').slideToggle(400);
        $(this).text()==='Show reviews' ? 
            $(this).html('Hide reviews<i class="fas fa-chevron-up ml-2">') : 
            $(this).html('Show reviews<i class="fas fa-chevron-down ml-2">');
 
    });

    $('#search-drink-btn').on('click', function(){
        // get the cokctails from the ingredients
        var ingredients = $('#ingredients-search').val();
        $.ajax('/cocktail', 
        {
            dataType: 'json', // type of response data
            data: {'ingredients': ingredients},
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", $('#token').attr('value'));
            },
            success: function (data) {
                $('#show-more-btn').show();
                fill_drink_container(data);
                activate_cells(ingredients);
            }
        });

        $('#drinks-grid-container').fadeIn(400);
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#drinks-grid-container").offset().top
        }, 1000);
        $('#scroll-up').fadeIn();


    });

});


function activate_ranking(){
    var options = {
        max_value: 5,
        step_size: 0.5,
        initial_value: 0,
        selected_symbol_type: 'utf8_star', // Must be a key from symbols
        cursor: 'normal',
        readonly: false,
        change_once: true, // Determines if the rating can only be set once
        ajax_method: 'POST',
        url: 'http://localhost/test.php',
        additional_data: {} // Additional data to send to the server
    }
    
        $("#selected-drink-rating").rate(options);
}

function fill_drink_container(data){
    $('#drinks-grid-container').empty();

    data = JSON.parse(data);

    var data_api = data.cocktails_API;
    var data_db = data.cocktails_DB;

    if ($.isEmptyObject(data_api) && $.isEmptyObject(data_db)){
        $('#no-drinks-info').fadeIn(200);
        $('#show-more-btn').hide();
    } else{
        $('#no-drinks-info').hide();
        $('#show-more-btn').fadeIn(200);
    }


    $.each(data_api, function(i, val) {
        if (i%3 == 0){ $('#drinks-grid-container').append('<div class="row d-inline-flex mb-4 drinks-row-holder"></div>');}
        $('.drinks-row-holder').last().append(
           '<div class="col-lg mt-2">' + 
                '<div class="cocktail-cell shadow" id="' + val.id +'" from-db=0>' + 
                    '<img src="' + val.picture + '">' +
                    '<div class="cocktail-cell-description">' +
                        '<p class="name">' + val.name + '</p>' +
                        '<div class="rating align-middle" data-rate-value=5></div>' +
                    '</div> ' +              
                '</div>' +
            '</div>'
        );
    });

    $.each(data_db, function(i, val) {
        if (i%3 == 0){ $('#drinks-grid-container').append('<div class="row d-inline-flex mb-4 drinks-row-holder"></div>');}
        $('.drinks-row-holder').last().append(
           '<div class="col-lg mt-2">' + 
                '<div class="cocktail-cell shadow" id="' + val.id +'" from-db=1>' + 
                    '<img src="' + val.picture + '">' +
                    '<div class="cocktail-cell-description">' +
                        '<p class="name">' + val.name + '</p>' +
                        '<div class="rating align-middle" data-rate-value=5></div>' +
                    '</div> ' +              
                '</div>' +
            '</div>'
        );
    });

}

function activate_cells(ingredients){
    $('.cocktail-cell').on('click', function(){
        // this handles clicking on cocktail to get more information
        var id = $(this).attr('id');
        $('#cocktail-modal-img').attr('src', $(this).find('img').attr('src'));  // set the image
        $('#cocktail-modal-name').text($(this).find('.name').text())  // set the title
        get_cocktail_deatils(id.substring(), ingredients);
        $('#cocktail-modal').modal('show');  // show the modal
    })
}

function get_cocktail_deatils(id, query_ingredients){
    $.ajax('/cocktail', 
    {
        dataType: 'json', 
        data: {'id': id},
        beforeSend: function (xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", $('#token').attr('value'));
        },
        success: function (data) {
            data = JSON.parse(data);
            $('#cocktail-modalingredients').empty();
            $('#drink-amounts').empty();

            $.each(data.ingredients, function(k, val){
                if (query_ingredients.toLowerCase().includes(k.toLowerCase())){
                    $('#cocktail-modalingredients').append(
                        "<p class='ingredient ingredient-searched'>" + k + "</p>"
                    );
                } else{
                    $('#cocktail-modalingredients').append(
                        "<p class='ingredient'>" + k + "</p>"
                    );
                }

                if (val == null){
                    $('#drink-amounts').append(
                        "<li class='amount'>" + k + "</li>"
                    );
                } else{
                    $('#drink-amounts').append(
                        "<li class='amount'>" + k + ": " + val + "</li>"
                    );
                }
            });
            
            $('#drink-recipe').text(data.recipe);

            activate_ranking();
            $('#selected-drink-rating').rate("setValue", data.rating);

        }
    });
}