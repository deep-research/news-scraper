$(document).ready(function() {
    $("#news-btn").click(function() {
        $.ajax({
            url: "/scrape",
            type: 'GET',
            success: function(response) {
                // Reload the page to display the latest data
                location.reload();
            }
        });
    })
});