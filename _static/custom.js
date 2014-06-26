$(function() {

    var json_path = "/_static/glaneuses.json";
    var debian_url = "http://packages.qa.debian.org/";
    var github_url = "https://github.com/";

    function get_action(meta) {
        var payload;
        switch(meta.type) {
            case "CreateEvent":
            payload = "created " + meta.payload.ref_type + " ";
            if (meta.payload.ref != null) {
                payload += "<a href=\"" + github_url + meta.repo.name +
                    meta.payload.ref +
                    "\">" + meta.payload.ref + "</a> at ";
            }
            break;
            case "PushEvent":
            payload = "pushed to " + "<a href=\"" + github_url +
                meta.repo.name + "/tree/" +
                meta.payload.ref.split('/')[2] + "\">" + 
                meta.payload.ref.split('/')[2] + "</a> at ";
            break;
            case "DeleteEvent":
            payload = "deleted " + meta.payload.ref_type + " ";
            if (meta.payload.ref != null) {
                payload += "<a href=\"" + github_url + meta.repo.name +
                    meta.payload.ref +
                    "\">" + meta.payload.ref + "</a> at ";
            }
            case "WatchEvent":
            payload = meta.payload.action + " ";
            break;
            case "PullRequestEvent":
            payload = meta.payload.action + " pull request " +
                "<a href=\"" + meta.payload.pull_request.html_url + "\">" +
                meta.repo.name + "/pull/" + meta.payload.number +
                "</a><br/>"  + meta.payload.pull_request.title;
            break;
            case "PullRequestReviewCommentEvent":
            payload = "commented on pull request " +
                "<a href=\"" +  meta.payload.html_url + "\">" +
                meta.repo.name + "#" +
                meta.payload.pull_request_url.split("/")[
                    meta.payload.pull_request_url.split("/").lenght-1] +
                "</a><br/>" +
                meta.payload.body;
            break;
            case "IssuesEvent":
            payload = meta.payload.action + " issue " +
                "<a href=\"" + meta.payload.issue.html_url + "\">" +
                meta.repo.name + "/issues/" + meta.payload.issue.number +
                "</a><br/>"  + meta.payload.issue.title;
            break;
            case "IssueCommentEvent":
            payload = "commented on issue " +
                "<a href=\"" + meta.payload.comment.html_url + "\">" +
                meta.repo.name + "#" + meta.payload.issue.number +
                "</a><br/>" +
                meta.comment.body;
            break;
        }
        payload += "<a href=\"" + github_url + meta.repo.name +
            "\">" + meta.repo.name + "</a><br/>";
        if (meta.type == "PushEvent") {
            meta.payload.commits.forEach(function(val, index) {
                payload += "<span style=\"font-size: small\">" +
                    "<a href=\"" + github_url +
                    meta.repo.name +
                    "/commits/" + val.sha + 
                    "\">" + val.sha.slice(0, 7) +
                    "</a> " + val.message.split("\n\n")[0] + "</span><br/>";
            });
        }
        payload += "<span style=\"font-size:small\">" + meta.created_at +
            "</span></p>";
        return payload;
    }

    $("div#main").append("<ul id=\"debpkg\"></ul>");

    $("div#todo-from-maintainer-dashboard")
        .append("<table id=\"udd\" class=\"docutils\">" +
                "<thead><tr><th>type</th>" +
                "<th>source</th>" +
                "<th>description</th></tr></thead>" +
                "<tbody></tbody></table>");

    $("div#python-packages").append("<table id=\"pypi\" class=\"docutils\">" +
                                    "<thead><tr><th rowspan=\"2\">name</th>" +
                                    "<th colspan=\"3\">latest downloads</th></tr>" +
                                    "<tr><td>day</td>" +
                                    "<td>week</td>" +
                                    "<td>month</td></tr>" +
                                    "</thead><tbody></tbody></table>");

    $("div#github-activity").append("<ul id=\"activity\"></ul>");

    $.getJSON(json_path, function(data) {
        if (data.deb !== undefined) {
            data.deb.forEach(function(val, index) {
                $("div#main ul#debpkg")
                    .append("<li><a href=\"" +
                            val.Url + "\">" +
                            val.Source + "</a></li>");
            });
        }
        if (data.udd !== undefined) {
            data.udd.forEach(function(val, index) {
                $("div#todo-from-maintainer-dashboard table#udd tbody")
                    .append("<tr><td>" + val[":type"] + "</td>" +
                        "<td><a href=\"" + debian_url + val[":source"] +
                            "\">" + val[":source"] + "</a></td>" +
                            "<td>" + val[":description"] + "<br/>" +
                            "<span style=\"font-size: small;\">" +
                            "<a href=\"" + val[":link"] + "\">" +
                            val[":details"] + "</a></span></td></tr>");
            });
        }
        if (data.pypi !== undefined) {
            data.pypi.forEach(function(val, index) {
                $("div#python-packages table#pypi tbody")
                    .append("<tr><td><a href=\"" + val.PackageUrl +
                            "\">" + val.Name + "</a></td>" +
                            "<td>" + val.Downloads.LastDay + "</td>" +
                            "<td>" + val.Downloads.LastWeek + "</td>" +
                            "<td>" + val.Downloads.LastMonth + "</td></tr>");
            });
        }
        if (data.github !== undefined) {
            data.github.forEach(function(val, index) {
                $("div#github-activity ul#activity")
                    .append("<li style=\"list-style-type: none\"><p>" +
                            get_action(val) + "</p>");
            });
        }
    });
});
