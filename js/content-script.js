let data = {};

function initToken() {
    chrome.runtime.sendMessage({
        message: 'init_cookies',
        url: 'https://devops.aliyun.com',
        name: 'TB_ACCESS_TOKEN'
    }, async function (response) {
        data['TB_ACCESS_TOKEN'] = response.data['TB_ACCESS_TOKEN'];
    });
    chrome.runtime.sendMessage({
        message: 'init_cookies',
        url: 'https://devops.aliyun.com',
        name: 'login_aliyunid_ticket'
    }, async function (response) {
        data['login_aliyunid_ticket'] = response.data['login_aliyunid_ticket'];
    });
}

function alertLogPanel(html) {
    $("div[class='header-mask__9LmE']").after($(html))
}

function requestTaskListData() {
    const settings = {
        "url": "https://devops.aliyun.com/api/graphql",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "cookie": "TB_ACCESS_TOKEN=" + data['TB_ACCESS_TOKEN'] + "; login_aliyunid_ticket=" + data['login_aliyunid_ticket'] + "; ",
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({
            "query": "\nquery SearchMyTasks(\n  $tql: String,\n  $pageSize: PageSizeType = 20,\n  $pageToken: String,\n  $organizationId: ObjectId\n) {\n  Search (type: task, pageSize:$pageSize, _organizationId:$organizationId, pageToken:$pageToken, tql: $tql){\n    totalSize,\n    nextPageToken,\n    result {\n      ... on Task {\n        _creatorId,\n        _executorId,\n        _id,\n        _organizationId,\n        _projectId,\n        involveMembers,\n        isArchived,\n        isDone,\n        accomplished,\n        parent {\n          content\n        },\n        subtaskCount {\n          total,\n          done\n        },\n        visible,\n        content,\n        _taskflowstatusId,\n        project {\n          _id,\n          name,\n          uniqueIdPrefix\n        },\n        uniqueId,\n        taskflowstatus {\n          _id,\n          _taskflowId,\n          kind,\n          name\n        },\n        priority,\n        startDate,\n        dueDate,\n        executor {\n          _id,\n          name,\n          avatarUrl\n        },\n        commentsCount,\n        attachmentsCount,\n        created,\n        updated,\n        scenariofieldconfig {\n          icon,\n          name\n        }\n      }\n    }\n  }\n}\n",
            "variables": {
                "tql": "(executorId = currentUser()) AND (projectId = null OR projectId IN tql(project, '(isSuspended = false) AND (isArchived = false) AND (isTemplate = false)')) AND (isArchived = false) ORDER BY updated DESC,updated DESC",
                "pageSize": 100
            }
        }),
    };

    let html = '<div class="aliyun-devops-log-show log-window">';
    $.ajax(settings).done(function (response) {
        console.log(response.data.Search.result)
        response.data.Search.result.filter(item => item.isDone === true).forEach(item => {
            //今天已完成
            html += '<p>' + item.content + '</p>';
        });

        response.data.Search.result.filter(item => item.isDone === false).forEach(item => {
            //明天待做
            html += '<p>' + item.content + '</p>';
        });

        response.data.Search.result.filter(item => item.isDone === false).forEach(item => {
            //今天未完成
            html += '<p>' + item.content + '</p>';
        });
        html += '</div>';
        alertLogPanel(html);
    });
}

function getTaskData() {
    if (data['TB_ACCESS_TOKEN'] === undefined || data['login_aliyunid_ticket'] === undefined) {
        initToken();
    }
    requestTaskListData();

}

function insertBtn() {
    const generalLogReportBtn = $('<button name="aliyun-devops-log-report" href="javascript:void(0)" title="生成日报">生成日报</button>')
    $("div[class='header-name-wrapper__2-RR']").append(generalLogReportBtn)
    $("button[name='aliyun-devops-log-report']").click(function () {
        getTaskData();
    });
}

setTimeout(insertBtn, 2000);
$("div[class='organization-portal-content-container']").bind(DOMNodeInserted, function (e) {
    setTimeout(insertBtn, 2000);
});
