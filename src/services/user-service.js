import { ContactUsUrl } from "../constants/urls";
import { SettingsCategory } from "../constants/settings";
import { SystemUserId } from "../constants/common";

export default class UserService {
    static dependencies = ["StorageService", "JiraService"];

    constructor($storage, $jira) {
        this.$storage = $storage;
        this.$jira = $jira;
    }

    getUser(userId) { return this.$storage.getUser(userId); }

    getAllUsers() { return this.$storage.getAllUsers(); }

    async saveGlobalSettings(users) {
        const settingsArr = [];
        const changeSetting = (sett, user, prop, retain, category) => {
            const item = {
                userId: user.id,
                category: category || SettingsCategory.Advanced,
                name: prop,
                value: sett[prop]
            };
            settingsArr.push(item);

            if (!item.value && !retain) {
                delete item.value;
            }
        };

        await Promise.all(users.map(async u => {
            const intgUser = u.id > SystemUserId;
            if (intgUser && u.deleted) {
                await this.$storage.deleteAllSettingsWithUserId(u.id);
                await this.$storage.deleteUser(u.id);
                return;
            }

            let user = await this.getUser(u.id);
            user = { ...user };

            user.jiraUrl = u.jiraUrl;
            user.userId = u.userId;
            user.email = u.email;

            changeSetting(u, user, "openTicketsJQL");
            changeSetting(u, user, "suggestionJQL");
            changeSetting(u, user, "disableJiraUpdates");
            changeSetting(u, user, "jiraUpdatesJQL");
            if (!intgUser) {
                changeSetting(u, user, "enableAnalyticsLogging", true);
                changeSetting(u, user, "enableExceptionLogging", true);
                changeSetting(u, user, "disableDevNotification");
                changeSetting(u, user, "useWebVersion", false, SettingsCategory.System);
            }

            await this.$storage.addOrUpdateUser(user);
        }));

        await this.$storage.bulkPutSettings(settingsArr);
    }

    async saveUser(user) {
        return this.$storage.addOrUpdateUser(user);
    }

    async getUsersList() {
        const users = (await this.$storage.getAllUsers()).filter(u => u.id !== 1);
        return users.map(u => ({ id: u.id, email: u.email, jiraUrl: u.jiraUrl, userId: u.userId }));
    }

    async getUserDetails(userId) {
        const currentUser = await this.getUser(userId);

        if (!currentUser) {
            return currentUser;
        }

        const feedbackUrl = `${ContactUsUrl}?name={0}&email={1}&javersion={2}&browser={3}&entry.326955045&entry.1696159737&entry.485428648={0}&entry.879531967={1}&entry.1426640786={2}&entry.972533768={3}`;
        currentUser.jiraUrl = currentUser.jiraUrl.toString().clearEnd('/');

        //this.$session.authTokken = currentUser.dataStore;
        const sessionUser = {
            userId: currentUser.id,
            jiraUrl: currentUser.jiraUrl,
            ticketViewUrl: `${currentUser.jiraUrl}/browse/`,
            profileUrl: `${currentUser.jiraUrl}/secure/ViewProfile.jspa`,
            feedbackUrl: `${feedbackUrl}&emb=true` //&embedded=true for directly using google forms
        };

        const jiraUrlLower = currentUser.jiraUrl.toLowerCase();

        if (jiraUrlLower.indexOf('pearson') >= 0 || jiraUrlLower.indexOf('emoneyadv') >= 0) {
            sessionUser.noDonations = true;
            sessionUser.hideDonateMenu = true;
        }
        else {
            delete sessionUser.noDonations;
        }
        return sessionUser;
    }
}