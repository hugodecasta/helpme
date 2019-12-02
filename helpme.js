
class HelpMe {

    // --------------------------------------------------

    constructor(app_name) {
        this.app_name = app_name
        this.stored_GX = {}
    }

    // --------------------------------------------------

    get_help_log_name() {
        return this.app_name+'help_log'
    }

    async get_help_log() {
        let help_log = localStorage.getItem(this.get_help_log_name())
        if(help_log == null) {
            await this.set_help_log({'@last_item':null})
            return await this.get_help_log()
        }
        help_log = JSON.parse(help_log)
        return help_log
    }

    async set_help_log(help_log) {
        help_log = JSON.stringify(help_log)
        localStorage.setItem(this.get_help_log_name(),help_log)
    }

    // --------------------------------------------------

    async get_help_item(help_item_name) {
        let help_log = await this.get_help_log()
        return help_log[help_item_name]
    }

    async set_help_item(help_item) {
        let help_log = await this.get_help_log()
        help_log[help_item.name] = help_item
        await this.set_help_log(help_log)
    }

    async help_item_exists(help_item_name) {
        let help_log = await this.get_help_log()
        return help_log.hasOwnProperty(help_item_name)
    }

    // --------------------------------------------------

    create_help_item(name, description) {
        let help_item = {
            name:name,
            description:description,
            viewed:false
        }
        return help_item
    }

    // --------------------------------------------------

    GX_create_help_item(name,description) {
        let help_item_gx = $('<div>').addClass('helpme')
        let name_gx = $('<div>').addClass('name')
        .html(name)
        let desc_gx = $('<div>').addClass('description')
        .html(description)
        help_item_gx.append(name_gx).append(desc_gx)
        return help_item_gx
    }

    GX_create_helping_copy(JQ) {
        let css = JQ.css(['border-radius','width','height','background-color','z-index'])
        let copy = $('<div>').addClass('helpme_copy').css(css)
        return copy
    }

    // --------------------------------------------------

    async register_last() {
        let last_item = await this.get_last_help_item()
    }

    // --------------------------------------------------

    async register_helpme(JQ, name, description, position) {
        if(!await this.help_item_exists(name)) {
            let help_item = this.create_help_item(name, description)
            await this.set_help_item(help_item)
        }
        let help_item = await this.get_help_item(name)
        console.log(help_item)
        if(help_item.viewed || this.stored_GX.hasOwnProperty(name))
            return
        let gx = this.GX_create_help_item(name, description)
        let copy = this.GX_create_helping_copy(JQ)
        this.stored_GX[name] = {
            gx:gx,
            int:null
        }
        $('body').append(gx)
        $('body').append(copy)
        setTimeout(function(){
            copy.remove()
        },2000)
        await this.set_last_help_item(help_item)
        function update_pose() {
            let top = JQ.offset().top
            let left = JQ.offset().left
            let bottom = top + JQ.outerHeight()
            let right = left + JQ.outerWidth()
            let pos = {
                'top':top,
                'left':left,
                'bottom':bottom,
                'right':right,
            }
            copy.css({top:top,left:left})
            let poses = position.split(' ')
            let mtop = pos[poses[0]]
            let mleft = pos[poses[1]]
            gx.css('top',mtop).css('left',mleft)
        }
        this.stored_GX[name].int = setInterval(update_pose)
        update_pose()
    }

    async register_view_helpme(name) {
        if(!this.stored_GX.hasOwnProperty(name))
            return
        let gx = this.stored_GX[name].gx
        let int = this.stored_GX[name].int
        clearInterval(int)
        gx.addClass('disappear_helpme')
        setTimeout(function(){
            gx.remove()
        },2000)
        delete this.stored_GX[name]
        let help_item = await this.get_help_item(name)
        help_item.viewed = true
        await this.set_help_item(help_item)
    }

    // --------------------------------------------------

    async reset_all() {
        let help_log = await this.get_help_log()
        for(let name in help_log)
            help_log[name].viewed = false
        await this.set_help_log(help_log)
    }

}