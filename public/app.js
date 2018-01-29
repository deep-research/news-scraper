$(document).ready(function() {
    // Scraping error message
    var currentLocation = window.location.href;
    if (currentLocation.endsWith("/index/success")) {
        console.log("Scrape complete with no errors")
    } else if (currentLocation.endsWith("/index/error")) {
        console.log("Scrape complete with errors")
    }

    // Button to scrape latest articles
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

    // Choose how many stories to display when the dropdown menu is changed
    $("#select-limit").change(function() { 
        // Extract the value of the form
        var displayLimit = $(this).val();

        // Reset the form
        $('#select-limit').get(0).selectedIndex = 0;

        // Run the url query
        window.location.href = "/index/limit/" + displayLimit;
    });

    // Toggle the comment form
    $(".show-form").click(function() {
        var articleId = $(this).attr("article-id");
        var commentForm =  $(".comment-form[article-id='" + articleId + "']");

        // Make sure the form is cleared
        $(commentForm).find("#title").val("");
        $(commentForm).find("#name").val("");
        $(commentForm).find("#comment").val("");

        // Find comment section elements
        var showCommentsState = $(".show-comments[article-id='" + articleId + "']").attr("collapsed");
        var showComments = $(".show-comments[article-id='" + articleId + "']");
        var commentDisplay = $(".comment-display[article-id='" + articleId + "']");

        // Close the comment display if it's open
        if (showCommentsState === "true") {
            showComments.attr("collapsed", "false");
            commentDisplay.slideToggle("200");
        }

        // Change the collapsed state
        if ($(commentForm).attr("collapsed") === "true") {
            $(commentForm).attr("collapsed", "false");
        } else if ($(commentForm).attr("collapsed") === "false") {
            $(commentForm).attr("collapsed", "true");
        }

        // Toggle the form
        $(this).next("form").slideToggle("200");
        
        // Scroll to the top of the form
        $('html, body').animate({
            scrollTop: ($(this).prev().offset().top)
        }, 500);  
    })

    // Submit the comment form
    $(".comment-form").submit(function(event) {
        event.preventDefault();

        // Extract data from the form
        var title = $(this).find("#title").val();
        var name = $(this).find("#name").val();
        var comment = $(this).find("#comment").val();

        var articleId = $(this).attr("article-id");


        // Find the comment section elements
        var showCommentsState = $(".show-comments[article-id='" + articleId + "']").attr("collapsed");
        var showComments = $(".show-comments[article-id='" + articleId + "']");
        var commentDisplay = $(".comment-display[article-id='" + articleId + "']");

        // Close the comment display if it's collapsed
        if (showCommentsState === "true") {
            showComments.attr("collapsed", "false");
            commentDisplay.slideToggle("200");
        }

        // Reset the form
        $(this).find("#title").val("");
        $(this).find("#name").val("");
        $(this).find("#comment").val("");

        // Close the form
        $(this).attr("collapsed", "false")
        $(this).slideToggle("200");

        // Prepare an object to send
        var commentObj = {
            title: title,
            user: name,
            comment: comment,
            id: articleId
        }

        // Send the new comment data
        $.ajax({
            data: commentObj,
            url: "/comment",
            type: "POST"
        }).done(function(response) {
            // console.log(response)
        })
    });

    // Display the comment section
    $(".show-comments").click(function() {
        // html element addresses
        var showComments = $(this);
        var commentDisplay = $(this).next(".comment-display");       
        var articleId = showComments.attr("article-id");

        // If it's open
        if (showComments.attr("collapsed") === "true") {
            // Change the state
            showComments.attr("collapsed", "false");

            // Close the section and scroll to the top of it
            commentDisplay.slideToggle("200");
            $('html, body').animate({
                scrollTop: (commentDisplay.prev().offset().top -67.5)
            }, 500);
        
            // Reset the data
            commentDisplay.html("");

        // If it's closed
        } else if (showComments.attr("collapsed") === "false"){
            var commentForm = $(".comment-form[article-id='" + articleId + "']");
            var formWasClosed = false;

            if (commentForm.attr("collapsed") === "true") {
                // Reset the form
                $(commentForm).find("#title").val("");
                $(commentForm).find("#name").val("");
                $(commentForm).find("#comment").val("");

                // Close the comment form
                commentForm.attr("collapsed", "false");
                commentForm.slideToggle("200");

                // Report the action
                formWasClosed = true;
            }

            // Do a query for the comment data
            $.ajax({
                url: "/comment/" + articleId,
                type: "GET"
            }).done(function(response) {
                var commentArray = response.comments;
                commentDisplay.html("")

                // Message if nothing was found
                if (commentArray.length === 0) {
                    commentDisplay.html("<p>There are no comments yet.</p>");

                    // Change the state and open the section
                    showComments.attr("collapsed", "true");
                    commentDisplay.slideToggle("200");

                    // Scroll instructions if the comment form was closed
                    if (formWasClosed === false) {
                        // Scroll to top of the section
                        $('html, body').animate({
                            scrollTop: (commentDisplay.prev().offset().top -67.5)
                        }, 500);
                    } else {
                    // Scroll instuctions if the comment form wasn't closed
                        $('html, body').animate({
                            scrollTop: (commentDisplay.prev().offset().top -260)
                        }, 500);
                    }
                }

                // Extract the comment data in a loop
                for (var i=0; i<commentArray.length; i++) {
                    // Comment data
                    var title = commentArray[i].title;
                    var user = commentArray[i].user;
                    var comment = commentArray[i].comment;
                    var commentId = commentArray[i]._id;

                    // Display the comments on the web page
                    if (i < commentArray.length-1) {
                        commentDisplay.append(
                            "<p>Title: <b>"+ title + "</b></p>" +
                            "<p>User: <u>" + user + "</u></p>" +
                            "<p>Comment: <i>"+ comment + "</i></p>" +
                            "<p>Delete: <a href='javascript:;'>" +
                            "<i class='fa fa-window-close remove-comment' " +
                            "comment-id='" + commentId + "' article-id='" + articleId + "'" +
                            " aria-hidden='true'></i></a></p>" +
                            "<br>"
                        )
                    };

                    // No <br> on the last comment
                    if (i === commentArray.length-1) {
                        commentDisplay.append(
                            "<p>Title: <b>"+ title + "</b></p>" +
                            "<p>User: <u>"+ user + "</u></p>" +
                            "<p>Comment: <i>"+ comment + "</i></p>" +
                            "<p>Delete: <i class='fa fa-window-close remove-comment' " +
                            "comment-id='" + commentId + "' article-id='" + articleId + "'" +
                            " aria-hidden='true'></i></p>"
                        )

                        // Change the state and open the section
                        showComments.attr("collapsed", "true");
                        commentDisplay.slideToggle("200");

                        // Scroll to top of the section
                        $('html, body').animate({
                            scrollTop: (commentDisplay.prev().offset().top -67.5)
                        }, 500);
                    }
                }
            })    
        }
    });

    // Remove a comment
    $("body").on("click", ".remove-comment", function() {
        var commentId = $(this).attr("comment-id");
        var articleId = $(this).attr("article-id");

        $.ajax({
            url: "/comment/remove" + '?' + $.param({"commentId": commentId, "articleId" : articleId}),
            type: "DELETE"
        }).done(function(response) {
            // console.log(response)

            // Click to close if a comment is deleted
            $(".show-comments[article-id='" + articleId + "']").trigger("click");
        })
    })
});