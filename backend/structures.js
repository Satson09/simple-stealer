// structures.js - Clean version (No global state, no BrowserStatistics)

class Cookie {
    constructor(Host, Path, Secure, Expires, Name, Value) {
        this.Host = Host;
        this.Path = Path;
        this.Secure = Secure;
        this.Expires = Expires;
        this.Name = Name;
        this.Value = Value;
    }

    Write() {
        const isHostSubdomain = this.Host.startsWith('.') ? 'FALSE' : 'TRUE';
        const isExpiresDefined = this.Secure === 0 ? 'FALSE' : 'TRUE';
        return [
            this.Host, isExpiresDefined, this.Path, isHostSubdomain,
            this.Secure, this.Expires, this.Name, this.Value
        ].join('\t') + '\n';
    }
}

class Login {
    constructor(LoginURL, Username, Password, Timestamp) {
        this.LoginURL = LoginURL;
        this.Username = Username;
        this.Password = Password;
        this.Timestamp = Timestamp;
    }

    Write() {
        return `LoginURL: ${this.LoginURL}\nUsername: ${this.Username}\nPassword: ${this.Password}\nTimestamp: ${this.Timestamp}\n\n`;
    }
}

class Autofill {
    constructor(Input, Value) {
        this.Input = Input;
        this.Value = Value;
    }

    Write() {
        return `Input: ${this.Input}\nValue: ${this.Value}\n\n`;
    }
}

class CreditCard {
    constructor(Guid, Name, Number, Address, Nickname, ExpirationMonth, ExpirationYear) {
        this.Guid = Guid;
        this.Name = Name;
        this.Number = Number;
        this.Address = Address;
        this.Nickname = Nickname;
        this.Expiration = `${ExpirationMonth}/${ExpirationYear}`;
    }

    Write() {
        return `Guid: ${this.Guid}\nName: ${this.Name}\nNumber: ${this.Number}\nAddress: ${this.Address}\nNickname: ${this.Nickname}\nExpiration: ${this.Expiration}\n\n`;
    }
}

class History {
    constructor(URL, Title, VisitCount, Timestamp) {
        this.URL = URL;
        this.Title = Title;
        this.VisitCount = VisitCount;
        this.Timestamp = Timestamp;
    }

    Write() {
        return `URL: ${this.URL}\nTitle: ${this.Title}\nVisitCount: ${this.VisitCount}\nTimestamp: ${this.Timestamp}\n\n`;
    }
}

class Download {
    constructor(URL, TargetPath, TotalBytes) {
        this.URL = URL;
        this.TargetPath = TargetPath;
        this.TotalBytes = TotalBytes;
    }

    Write() {
        return `URL: ${this.URL}\nTargetPath: ${this.TargetPath}\nTotalBytes: ${this.TotalBytes}\n\n`;
    }
}

class Bookmark {
    constructor(URL, TargetName, Timestamp) {
        this.URL = URL;
        this.TargetName = TargetName;
        this.Timestamp = Timestamp;
    }

    Write() {
        return `URL: ${this.URL}\nTargetName: ${this.TargetName}\nTimestamp: ${this.Timestamp}\n\n`;
    }
}

module.exports = {
    Cookie,
    Login,
    Autofill,
    CreditCard,
    History,
    Download,
    Bookmark
};


