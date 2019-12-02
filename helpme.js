
class HelpMe {

    // --------------------------------------------------

    constructor(app_name) {
        this.app_name = app_name

        this.help_events = {}
        this.registered_jq = {}
        this.help_queue = []

        this.next_queue_index = 0
    }

    // --------------------------------------------------
    // --------------------------------------------------

    GX_create_help_event(help_event) {
        let help_event_gx = $('<div>').addClass('helpme')
        let title_gx = $('<div>').addClass('title')
        .html(help_event.title)
        let desc_gx = $('<div>').addClass('description')
        .html(help_event.description)
        help_event_gx.append(title_gx).append(desc_gx)
        return help_event_gx
    }

    GX_create_helping_copy(JQ) {
        let css = JQ.css(['border-radius','width','height','background-color','z-index'])
        let copy = $('<div>').addClass('helpme_copy').css(css)
        return copy
    }

    // --------------------------------------------------

    get_help_log_name() {
        return this.app_name+'help_log'
    }

    get_help_log() {
        let help_log = localStorage.getItem(this.get_help_log_name())
        if(help_log == null) {
            this.set_help_log({})
            return this.get_help_log()
        }
        help_log = JSON.parse(help_log)
        return help_log
    }

    set_help_log(help_log) {
        help_log = JSON.stringify(help_log)
        localStorage.setItem(this.get_help_log_name(),help_log)
    }

    // --------------------------------------------------

    load_help_event(name) {
        let help_log = this.get_help_log()
        return help_log[name]
    }

    save_help_event(name,help_event) {
        let help_log = this.get_help_log()
        help_log[name] = help_event
        this.set_help_log(help_log)
    }

    help_event_exists(name) {
        let help_log = this.get_help_log()
        return help_log.hasOwnProperty(name)
    }

    // --------------------------------------------------

    reset_all() {
        let help_log = this.get_help_log()
        for(let name in help_log)
            help_log[name].available = true
        this.set_help_log(help_log)
    }

    // --------------------------------------------------

    _launch_event(help_event) {
        let jq = this.registered_jq[help_event.jq]
        let copy = this.GX_create_helping_copy(jq)
        let gx = this.GX_create_help_event(help_event)

        help_event.gx = gx
        $('body').append(gx)

        let tthis = this
        help_event.interval = setInterval(function(){

            if(jq.css('display') == '') {
                tthis._end_event(help_event)
                return
            }

            let jq_pos = {
                'top':jq.offset().top,
                'left':jq.offset().left,
                'bottom':jq.offset().top+jq.outerHeight(),
                'right':jq.offset().left+jq.outerWidth(),
            }
            let gx_pos = {
                'top':gx.offset().top,
                'left':gx.offset().left,
                'bottom':gx.offset().top+gx.outerHeight(),
                'right':gx.offset().left+gx.outerWidth(),
            }
            let win = {
                width:$(window).innerWidth(),
                height:$(window).outerHeight(),
            }

            let top = jq_pos.top
            let left = jq_pos.right

            if(gx_pos.right > win.width) {
                left = jq_pos.left - gx_pos.width
            }

            gx.css({top:top,left:left})
        })
    }

    _end_event(help_event) {
        help_event.available = false
        this.save_help_event(help_event.name,help_event)
        if(!help_event.hasOwnProperty('gx'))
            return
        clearInterval(help_event.interval)
        help_event.gx.addClass('disappear_helpme')
        setTimeout(function(){
            help_event.gx.remove()
        },2000)

    }

    // --------------------------------------------------

    set_help_event(name, help_event) {
        if(help_event == null)
            return
            help_event.name = name
        help_event.available = true
        if(this.help_event_exists(name)) {
            let existing_event = this.load_help_event(name)
            help_event.available = existing_event.available
        }
        this.save_help_event(name, help_event)
        this.help_events[name] = help_event
    }

    add_help_event_to_queue(name) {
        this.help_queue.push(name)
    }

    queue_help_event(name, help_event) {
        this.set_help_event(name, help_event) 
        this.add_help_event_to_queue(name)
    }

    register_jq(id, jq) {
        this.registered_jq[id] = jq
    }

    // --------------------------------------------------

    next_queued_event() {
        if(this.next_queue_index >= this.help_queue.length)
            return null
        if(this.help_events[this.help_queue[this.next_queue_index]] == null)
            return this.help_queue[this.next_queue_index]
        let next_is_available = this.help_events[this.help_queue[this.next_queue_index]].available
        while(!next_is_available) {
            this.next_queue_index += 1
            if(this.help_events[this.help_queue[this.next_queue_index]] == null)
                break
            next_is_available = this.help_events[this.help_queue[this.next_queue_index]].available
        }
        return this.help_queue[this.next_queue_index]
    }

    past_queued_event() {
        if(this.next_queue_index > 0)
            return this.help_queue[this.next_queue_index-1]
        return null
    }

    // --------------------------------------------------

    trigger_event(name) {
        let help_event = this.help_events[name]
        if(help_event == null)
            return
        this._launch_event(help_event)
    }

    end_event(name) {
        this._end_event(this.help_events[name])
    }

    trigger_next_queued_event() {
        let next_event = this.next_queued_event()
        if(next_event == null)
            return
        let past_event = this.past_queued_event()
        if(past_event != null)
            this.end_event(past_event)
        this.next_queue_index += 1
        this.trigger_event(next_event)
    }

    trigger_queue(event_name=null) {
        if(event_name == null) {
            this.trigger_next_queued_event()
        } else {
            if(typeof(event_name) == typeof(''))
                event_name = [event_name]
            for(let name of event_name) {
                if(name == this.next_queued_event()) {
                    this.trigger_next_queued_event()
                    break
                }
            }
        }
    }

}