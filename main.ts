// 导入库
import { App, Modal, Notice, Plugin, PluginSettingTab, Setting,TAbstractFile,MarkdownView } from 'obsidian';
import moment from 'moment'

// 接口
interface MyPluginSettings {
	editname: string;	// 编辑时间的字段
	separator: string;	// 分割符
	timestyle: string;	// 时间的样式
}
// 插件默认设置
const DEFAULT_SETTINGS: MyPluginSettings = {
	editname: "update",
	separator: "::",
	timestyle: "YYYY-MM-DD HH:mm:ss",
}

// 插件主要功能
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	// 插件重载
	async onload() {
		console.log('loading plugin Update-Data');  // 打印插件加载信息

		await this.loadSettings(); // 导入配置
		// 界面---命令列表
		this.addCommand({ // 命令列表里面添加一个命令
			id: 'insert-edit-time',
			name: '插入编辑字段与时间', // 命令的名字
			// callback: () => {
			// 	console.log('Simple Callback');
			// },
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.activeLeaf.view;
				if (view instanceof MarkdownView) {
					// 
					const editor = view.sourceMode.cmEditor;
					// 记住光标的位置
					const cursor = editor.getCursor();
					var doc = editor.getDoc();
					var cursorline = editor.getCursor().line;
					var line = editor.getLine(cursorline);
					var line1 = this.settings.editname + this.settings.separator + " "  + moment().format(this.settings.timestyle);
					doc.replaceRange(line1, {line:cursorline,ch:0},{line:cursorline,ch:line1.length});
					return true
				}
				return false
			}
		});
		// 界面---设置界面
		this.addSettingTab(new SampleSettingTab(this.app, this));
		// 编辑界面
		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			// console.log('codemirror', cm);
		});

		this.registerEvent(this.app.vault.on("modify", async (file) => {this.reloadFile(file);}))
	}
	escapeRegExp(str:string) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\:]/g, '\\$&');
	  }

	async reloadFile(file: TAbstractFile) {
		// this.app.metadataCache
		const view = this.app.workspace.activeLeaf.view;
		if (view instanceof MarkdownView) {
			// 
			const editor = view.sourceMode.cmEditor;
			// 记住光标的位置
			const cursor = editor.getCursor();
			var doc = editor.getDoc();
			var data = doc.getValue();
			var newdata = this.settings.editname + this.settings.separator + " "  + moment().format(this.settings.timestyle);
			var regstr = new RegExp("^" + this.settings.editname + this.escapeRegExp(this.settings.separator) + ".*$", 'm')  
			var data1 = data.replace(regstr, newdata)
			doc.setValue(data1)
			// 设置光标的位置
			editor.setCursor(cursor);
		}
		else {
			console.log("not view")
		}


	}


	// 卸载插件
	onunload() {
		console.log('unloading plugin Update-Data');
	}
	// 导入配置
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	// 保存配置
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
// 实用的命令
class SampleModal extends Modal {
	setting :MyPluginSettings;

	constructor(app: App, setting: MyPluginSettings) {
		super(app);
		this.setting = setting;
	}
	// 打开的程序
	onOpen() {
		const view = this.app.workspace.activeLeaf.view;
		if (view instanceof MarkdownView) {
			// 
			const editor = view.sourceMode.cmEditor;
			// 记住光标的位置
			const cursor = editor.getCursor();
			var doc = editor.getDoc();
			var cursorline = editor.getCursor().line;
        	var line = editor.getLine(cursorline);
			var line1 = this.setting.editname + this.setting.separator + " "  + moment().format(this.setting.timestyle);
			doc.replaceRange(line1, {line:cursorline,ch:0},{line:cursorline,ch:line1.length});
		}
	}
	// 关闭的程序
	onClose() {
	}
}
// 插件的设置界面类
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	// 界面配置
	display(): void {
		let {containerEl} = this;

		containerEl.empty();
		// 界面的名称
		containerEl.createEl('h2', {text: '数据更新插件设置'});
		// 一个配置项
		new Setting(containerEl)
			.setName('编辑时间字段') // 设置名称
			.setDesc('yaml中编辑时间的字段名称') // 设置说明
			.addText(text => text
				.setPlaceholder('字段名称')
				.setValue('update')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.editname = value; //保存设置到变量
					await this.plugin.saveSettings(); //保存设置到文件
				}));
		// 一个配置项
		new Setting(containerEl)
			.setName('分割符') // 设置名称
			.setDesc('编辑时间与时间之间的分割符号') // 设置说明
			.addText(text => text
				.setPlaceholder('分割符号')
				.setValue('::')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.separator = value; //保存设置到变量
					await this.plugin.saveSettings(); //保存设置到文件
				}));
		// 一个配置项
		new Setting(containerEl)
			.setName('时间格式') // 设置名称
			.setDesc('时间的格式样式') // 设置说明
			.addText(text => text
				.setPlaceholder('常用样式')
				.setValue('YYYY-MM-DD HH:mm:ss')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.timestyle = value; //保存设置到变量
					await this.plugin.saveSettings(); //保存设置到文件
				}));
	}
}
