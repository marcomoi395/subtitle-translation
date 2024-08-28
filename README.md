# Subtitle Translator

This repository provides a tool for translating subtitle files from English to Vietnamese. It processes all subtitle files (`.srt` format) in a specified folder and translates the text while keeping the original subtitle timing intact.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Batch Translation**: Translates all `.srt` files in a specified folder from English to Vietnamese.
- **Subtitle Timing Preservation**: Keeps the original subtitle timing format intact.
- **Support for Multiple Files**: Automatically processes multiple subtitle files in a single folder.

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/subtitle-translator.git
   cd subtitle-translator`` 

2.  **Install Dependencies** Make sure you have [Node.js](https://nodejs.org/) installed, then run:
  
    ```
    npm install
    ``` 
    
## Usage

1.  Place all your `.srt` subtitle files into the `subtitles` folder.
    
2.  Run the script:
    
    ```
    node index.js
    ```
    
4.  Enter the source and destination folders then click Translate.
    

## Examples

### Input Subtitle (`example.srt`):
```
1
00:00:04,530 --> 00:00:09,060
Hello!

2
00:00:09,090 --> 00:00:13,980
How are you?
```

### Translated Output:
```
1
00:00:04,530 --> 00:00:09,060
Xin chào!

2
00:00:09,090 --> 00:00:13,980
Bạn khỏe không? 
```

## Limitations
-   The translation is performed using an external API, so an internet connection is required.
-   Currently, only `.srt` files are supported.
-   The quality of the translation depends on the performance of the translation API.

## Contributing
We welcome contributions! If you find a bug or want to add a new feature, please create an issue or a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
