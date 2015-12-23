from django import template

from core.plugins_point import DatalPluginPoint

register = template.Library()


@register.simple_tag(takes_context=True)
def plugins_call(context, method_name):
    response = ''
    plugins = DatalPluginPoint().get_plugins()
    for plugin in plugins:
        if plugin.is_active() and hasattr(plugin, method_name):
            method = getattr(plugin, method_name)
            response += method(context)
    return response
