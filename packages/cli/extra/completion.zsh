###-begin-kumpan-completion-###
if type compdef &>/dev/null && type kumpan &> /dev/null; then
  _kumpan_completion () {
    typeset -A opt_args
    local state line cmd values

    _arguments -C \
      '1:cmd:->cmds' \
      '*::arg:->args'

    case $state in
      cmds)
        _values "kumpan command" \
          "add[Add component|hook|config stuffs to your project]" \
          "list[List components|hooks|configs]" \
          "completion[Install or uninstall tab completion]"
        ;;
      args)
        case $line[1] in
          add)
            _kumpan_add_command
            ;;
          list)
            _kumpan_list_command
            ;;
          completion)
            _kumpan_completion_command
            ;;
        esac
        ;;
    esac

    return 1
  }

  _kumpan_add_command() {
    local line state scope
    
    _arguments -C \
      '1: :->cmds' \
      '*::arg:->args'

    case $state in
      cmds)
        _values "kumpan_add command" "component" "hook" "config"
        ;;
      args)
        case $line[1] in
          component)
            _kumpan_add_component_command
          ;;
          hook)
            _kumpan_add_hook_command
          ;;
          config)
            _kumpan_add_config_command
          ;;
        esac
        ;;
    esac
  }
  
  _kumpan_add_component_command() {
    local root; root="__ROOT__"
    _arguments -C \
      '1: :{
        _wanted local-directories desc componentsglob compadd - /$root/scopes/components/*(^\.:t)
      }'\
      '2: :_path_files -/'
  }

  _kumpan_add_hook_command() {
    local root; root="__ROOT__"
    _arguments -C \
      '1: :{
        _wanted local-directories desc componentsglob compadd - /$root/scopes/hooks/*(^\.:t)
      }'\
      '2: :_path_files -/'
  }

  _kumpan_add_config_command() {
    local root; root="__ROOT__"
    _arguments -C \
      '1: :{
        _wanted local-directories desc componentsglob compadd - /$root/scopes/configs/*
      }'\
      '2: :_path_files -/' 
  }


  _kumpan_list_command() {
    _values "kumpan_list command" "components" "hooks" "configs"
  }

  _kumpan_completion_command() {
    _values "kumpan completion command" \
            "install" \
            "uninstall"
  }


  compdef _kumpan_completion kumpan
fi
###-end-kumpan-completion-###
