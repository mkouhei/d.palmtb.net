$(function() {

    var json_path = '/_static/glaneuses.json';
    var debian_url = 'https://packages.qa.debian.org/';
    var github_url = 'https://github.com/';

    function get_action(meta) {
        var payload;
        switch (meta.type) {
            case 'CreateEvent':
            payload = 'created ' + meta.payload.ref_type + ' ';
            if (meta.payload.ref != null) {
                payload += '<a href="' + github_url + meta.repo.name +
                    meta.payload.ref +
                    '">' + meta.payload.ref + '</a> at ';
            }
            break;
            case 'PushEvent':
            payload = 'pushed to ' + '<a href="' + github_url +
                meta.repo.name + '/tree/' +
                meta.payload.ref.split('/')[2] + '">' +
                meta.payload.ref.split('/')[2] + '</a> at ';
            break;
            case 'ForkEvent':
            payload = 'forked ' + '<a href="' + github_url + meta.repo.name +
                '">' + meta.repo.name + '</a> to ' +
                '<a href="' + meta.payload.forkee.html_url + '">' +
                meta.payload.forkee.full_name + '</a><br/>';
            break;
            case 'DeleteEvent':
            payload = 'deleted ' + meta.payload.ref_type + ' ';
            if (meta.payload.ref != null) {
                payload += '<a href="' + github_url + meta.repo.name +
                    meta.payload.ref +
                    '">' + meta.payload.ref + '</a> at ';
            }
            break;
            case 'WatchEvent':
            payload = meta.payload.action + ' ';
            break;
            case 'PullRequestEvent':
            payload = meta.payload.action + ' pull request ' +
                '<a href="' + meta.payload.pull_request.html_url + '">' +
                meta.repo.name + '/pull/' + meta.payload.number +
                '</a><br/>' + meta.payload.pull_request.title;
            break;
            case 'PullRequestReviewCommentEvent':
            payload = 'commented on pull request ' +
                '<a href="' + meta.payload.html_url + '">' +
                meta.repo.name + '#' + meta.payload.pull_request.number +
                '</a><br/>' +
                meta.payload.body;
            break;
            case 'IssuesEvent':
            payload = meta.payload.action + ' issue ' +
                '<a href="' + meta.payload.issue.html_url + '">' +
                meta.repo.name + '#' + meta.payload.issue.number +
                '</a><br/><span style="font-size: small">' +
                meta.payload.issue.title + '</span><br/>';
            break;
            case 'IssueCommentEvent':
            payload = 'commented on issue ' +
                '<a href="' + meta.payload.comment.html_url + '">' +
                meta.repo.name + '#' + meta.payload.issue.number +
                '</a><br/>' +
                meta.payload.comment.body;
            break;
        }
        if ((meta.type != 'ForkEvent') && (meta.type != 'IssuesEvent')) {
        payload += '<a href="' + github_url + meta.repo.name +
            '">' + meta.repo.name + '</a><br/>';
        }
        if (meta.type == 'PushEvent') {
            meta.payload.commits.forEach(function(val, index) {
                payload += '<span style="font-size: small">' +
                    '<a href="' + github_url +
                    meta.repo.name +
                    '/commits/' + val.sha +
                    '">' + val.sha.slice(0, 7) +
                    '</a> ' + val.message.split('\n\n')[0] + '</span><br/>';
            });
        }
        payload += '<span style="font-size:small">' + meta.created_at +
            '</span></p>';
        return payload;
    }

    if (location.pathname != '/pages/about.html') {
        return;
    }

    $('div#main').append('<ul id="debpkg"></ul>');

    $('div#todo-from-maintainer-dashboard')
        .append('<table id="udd" class="docutils">' +
                '<thead><tr><th>type</th>' +
                '<th>source</th>' +
                '<th>description</th></tr></thead>' +
                '<tbody></tbody></table>');

    $('div#python-packages').append('<table id="pypi" class="docutils">' +
                                    '<thead><tr><th>name</th>' +
                                    '<td>version</td>' +
                                    '<td>published</td>' +
                                    '<td>source code</td></tr>' +
                                    '</thead><tbody></tbody></table>');

    $('div#ruby-gems').append('<table id="rubygems" class="docutils">' +
                                    '<thead><tr><th>name</th>' +
                                    '<th>downloads</th>' +
                                    '</thead><tbody></tbody></table>');

    $('div#github-activity').append('<ul id="activity"></ul>');

    $.getJSON(json_path, function(data) {
        if (data.deb !== undefined) {
            data.deb.forEach(function(val, index) {
                if (val != null) {
                    $('div#main ul#debpkg')
                        .append('<li><a href="' +
                                val.Url + '">' +
                                val.Source + '</a></li>');
                }
            });
        }

        var getLink = function f(val) {
            var payload = '';
            if (val[':link'] != null) {
                payload = '<span style="font-size: small;">' +
                    '<a href="' + val[':link'] + '">' +
                    val[':details'] + '</a></span>';
            } else {
                payload = '<span style="font-size: small;">' +
                    val[':details'] + '</span>';
            }
            return payload;
        };
        if (data.udd !== undefined && data.udd !== null) {
            data.udd.forEach(function(val, index) {
                if (val != null) {
                    $('div#todo-from-maintainer-dashboard table#udd tbody')
                        .append('"<tr><td>' + val[':type'] + '</td>' +
                                '<td><a href="' + debian_url + val[':source'] +
                                '">' + val[':source'] + '</a></td>' +
                                '<td>' + val[':description'] + '<br/>' +
                                getLink(val) + '</td></tr>');
                }
            });
        }
        if (data.pypi !== undefined) {
            data.pypi.forEach(function(val, index) {
              if (val != null) {
                    $('div#python-packages table#pypi tbody')
                        .append('<tr><td><a href="' + val.package_manager_url +
                                '">' + val.name + '</a></td>' +
                                '<td>' + val.latest_release_number + '</td>' +
                                '<td>' + val.latest_release_published_at + '</td>' +
                                '<td><a href="' + val.repository_url +
                                '">source code</a></td></tr>');
                }
            });
        }
        if (data.rubygems !== undefined) {
            data.rubygems.forEach(function(val, index) {
                if (val != null) {
                    $('div#ruby-gems table#rubygems tbody')
                        .append('<tr><td><a href="' + val.project_uri +
                                '">' + val.name + '</a></td>' +
                                '<td>' + val.downloads + '</td></tr>');
                }
            });
        }
        if (data.github !== undefined) {
            data.github.forEach(function(val, index) {
                if (val != null) {
                    $('div#github-activity ul#activity')
                        .append('<li style="list-style-type: none"><p>' +
                                get_action(val) + '</p>');
                }
            });
        }
    });
});
