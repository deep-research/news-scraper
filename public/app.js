$(document).ready(function() {
    // Scraping error message
    var currentLocation = window.location.href;
    if (currentLocation.endsWith("/index/success")) {
        console.log("Scrape complete with no errors")
    } else if (currentLocation.endsWith("/index/error")) {
        console.log("Scrape complete with errors")
    }

    $("#news-btn").click(function() {
        // Search message displayed while the search continues
        $("#wait").html("Searching for articles...")

        $.ajax({
            url: "/scrape",
            type: 'GET'
        }).done(function(response) {
            // Reload the page to display the latest data
            if (response === "Scrape complete with no errors") {
                window.location.replace("/index/success")
            } else {
                window.location.replace("/index/error")
            }   
        })
    })

    $("#select-limit").change(function() { 
        var displayLimit = $(this).val();
        $('#select-limit').get(0).selectedIndex = 0;

        window.location.href = "/index/limit/" + displayLimit;
    });

    $(".show-form").click(function() {
        $(this).next("form").slideToggle("200"); 
        $('html, body').animate({
            scrollTop: ($(this).prev().offset().top)
        }, 500);  
    })

    $(".comment-form").submit(function(event) {
        event.preventDefault();

        // Extract data from the form
        var title = $(this).find("#title").val();
        var name = $(this).find("#name").val();
        var comment = $(this).find("#comment").val();
        var articleId = $(this).attr("article-id");

        // Reset the form
        $(this).find("#title").val("");
        $(this).find("#name").val("");
        $(this).find("#comment").val("");

        $(this).slideToggle("200");

        var commentObj = {
            title: title,
            user: name,
            comment: comment,
            id: articleId
        }

        $.ajax({
            data: commentObj,
            url: "/comment",
            type: "POST"
        }).done(function(response) {
            console.log(response)
        })
    });

    $(".show-comments").click(function() {
        var articleId = $(this).attr("article-id")

        if ($(this).attr("collapsed") === "false") {
            $(this).attr("collapsed", "true")

            // $(this).next("form").slideToggle("200");
            // $('html, body').animate({
            //     scrollTop: ($(this).prev().offset().top)
            // }, 500);           
        } else if ($(this).attr("collapsed") === "true") {
            $(this).attr("collapsed", "false")
            $.ajax({
                url: "/comment/" + articleId,
                type: "GET"
            }).done(function(response) {
                var commentArray = response.comments;
            }) 

            // $(this).next("form").slideToggle("200");
            // $('html, body').animate({
            //     scrollTop: ($(this).prev().offset().top)
            // }, 500);    
        }

    });
});