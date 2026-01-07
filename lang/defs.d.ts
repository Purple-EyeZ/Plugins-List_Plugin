export default interface LangValues {
"plugins_list": {
values: typeof import("./values/base/plugins_list.json");
fillers: {
"toast.plugin.update.success": { "plugin": string }
"toast.plugin.update.fail": { "plugin": string }
"toast.plugin.delete.success": { "plugin": string }
"toast.plugin.delete.fail": { "plugin": string }
"toast.plugin.install.success": { "plugin": string }
"toast.plugin.install.fail": { "plugin": string }
"toast.theme.delete.success": { "theme": string }
"toast.theme.delete.fail": { "theme": string }
"toast.theme.install.success": { "theme": string }
"toast.theme.install.fail": { "theme": string }
};
};
};