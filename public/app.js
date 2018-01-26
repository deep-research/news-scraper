$(document).ready(function() {
    var currentLocation = window.location.href;
    if (currentLocation.endsWith("/index/success")) {
        console.log("Scrape complete with no errors")
    } else if (currentLocation.endsWith("/index/error")) {
        console.log("Scrape complete with errors")
    }

    $("#news-btn").click(function() {
        // Search message displayed while the search continues
        $("#wait").text("Searching for articles...")

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
});