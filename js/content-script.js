function createPage() {
    const page = $('<div class="votobo-fetch"><span>此产品支持采集到心潮无限</span><button name="infinite_now_dev" href="javascript:void(0)" title="加入爆款开发引擎">立即开发</button></div>')
    $('body').append(page)

    $("button[name='infinite_now_dev']").click(function () {
        const html = document.documentElement.outerHTML
        console.log(html)
        console.log(location)
    });
}

createPage()

