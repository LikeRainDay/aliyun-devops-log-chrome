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

function isToday(date, today) {
    if (date == null) {
        return false;
    }
    const split = date.split('T');
    const waitCalDate = new Date(split[0]);
    return waitCalDate.getDate() === today.getDate() &&
        waitCalDate.getMonth() === today.getMonth() &&
        waitCalDate.getFullYear() === today.getFullYear();
}

function isTomorrow(date, today) {
    if (date == null) {
        return false;
    }
    const split = date.split('T');
    const day3 = new Date();
    day3.setTime(day3.getTime() + 24 * 60 * 60 * 1000);
    const newVar = (day3.getMonth() + 1) < 10 ? "0" + (day3.getMonth() + 1) : (day3.getMonth() + 1);
    const tomorrow = day3.getFullYear() + "-" + newVar + "-" + day3.getDate();
    console.log(split[0], tomorrow, split[0] === tomorrow)
    return split[0] === tomorrow;
}

function generalItemElement(taskId, projectName, taskName) {
    const taskUrl = "https://devops.aliyun.com/task/" + taskId;
    return `<a href=${taskUrl}>${projectName}-${taskName}</a>`
}

function convertToContent(html, todayNoCompile) {
    for (let i = 0; i < todayNoCompile.length; i++) {
        html += (i + 1) + '. ' + generalItemElement(todayNoCompile[i]._id, todayNoCompile[i].project.name, todayNoCompile[i].content);
    }
    return html;
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
    const today = new Date();
    let html = '<div class="aliyun-devops-log-show log-window">';
    $.ajax(settings).done(function (response) {
        const compileTasks = response.data.Search.result.filter(item => item.isDone === true);
        const noCompileTasks = response.data.Search.result.filter(item => item.isDone === false);
        html += '<h3>今天已完成:</h3>';
        html = convertToContent(html, compileTasks.filter(item => isToday(item.accomplished, today)));
        html += '<h3>明天待做:</h3>';
        html = convertToContent(html, noCompileTasks.filter(item => isTomorrow(item.dueDate, today)));
        html += '<h3>今天未完成:</h3>';
        html = convertToContent(html, noCompileTasks.filter(item => isToday(item.dueDate, today)));
        html += '</div>';
        $.dialog({
            titleText: '日报',
            contentHtml: html
        });
    });
}

function getTaskData() {
    if (data['TB_ACCESS_TOKEN'] === undefined || data['login_aliyunid_ticket'] === undefined) {
        initToken();
    }
    requestTaskListData();

}

function insertBtn() {
    const generalLogReportBtn = $('<button name="aliyun-devops-log-report" href="javascript:void(0)" title="日报">日报</button>')
    $("div[id='tb-navigation-customOperation']").after(generalLogReportBtn)
    $("button[name='aliyun-devops-log-report']").click(function () {
        getTaskData();
    });
}

setTimeout(insertBtn, 2000);

