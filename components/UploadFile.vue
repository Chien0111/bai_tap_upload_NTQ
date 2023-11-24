<template>
  <div class="p-6">
    <div class="file-input-container" @dragover.prevent @drop="handleDrop">
      <input
        class="mb-3"
        type="file"
        name="file"
        ref="inputFile"
        multiple
        hidden
        @change="handleChangeFile"
      />
      <button @click="handleOpen('file')" class="bg-slate-300 rounded p-4 m-2">
        Upload file
      </button>

      <input
        class="mb-3"
        type="file"
        name="file"
        ref="inputFolder"
        webkitdirectory
        multiple
        hidden
        @change="handleChangeFolder"
      />
      <button
        @click="handleOpen('folder')"
        class="bg-slate-300 rounded p-4 m-2"
      >
        Upload folder
      </button>
    </div>
    <ul class="border border-indigo-600 my-6">
      <li
        v-for="(item, index) in files"
        :key="index"
        class="flex item-center m-2"
      >
        <div>
          <img
            v-if="item.preview === 'folder'"
            src="../static/folder.png"
            alt=""
            class="w-[50px] h-[50px]"
          />
          <img v-else :src="item.preview" class="w-[50px] h-[50px]" />
        </div>
        <div class="w-[90%] p-2">
          <div class="text-lg mb-2 flex justify-between">
            <div>
              {{ item.name }}
              <span v-if="item.process !== 100" class="font-bold">{{
                item.process + "%"
              }}</span>
              <span v-if="item.isScan" class="ml-2" style="color: #ffcc66"
                >Scanning...</span
              >
            </div>
            <div
              class="hover:cursor-pointer flex"
              @click="handleDeleteFile(index)"
            >
              <span v-if="item.fileLength" class="font-bold text-xl mr-3"
                >{{ item.processFile }}/{{ item.fileLength }}</span
              >
              <span>X</span>
            </div>
          </div>
          <div
            v-if="item.isShowProgress"
            :class="{
              'progress-bar': true,
              'progress-bar-striped': true,
              'mt-0': true,
              'h-[8px]': true,
              rounded: true,
              'progress-bar-animated': item.process === 100,
            }"
            role="progressbar"
            aria-valuenow="75"
            aria-valuemin="0"
            aria-valuemax="100"
            :style="{ width: item.process + '%' }"
          ></div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  data() {
    return {
      files: [],
    };
  },
  methods: {
    handleChangeFile(event) {
      this.handleChangeListFile([...event.target.files], "file");
    },
    handleChangeFolder(event) {
      this.handleChangeListFile([...event.target.files], "folder");
    },
    handleDrop(event) {
      event.preventDefault();
      const dt = event.dataTransfer;
      const items = dt.items;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry.isDirectory) {
            //folder
            this.readDirectory(entry, (numberOfEntries) => {
              const item = {
                name: entry.name,
                fileLength: numberOfEntries,
              };
              this.uploadFiles(item, "folder");
            });
          } else {
            // file
            this.handleChangeListFile([item.getAsFile()], "file");
          }
        }
      }
    },
    readDirectory(directoryEntry, callback) {
      const directoryReader = directoryEntry.createReader();
      directoryReader.readEntries((entries) => {
        const numberOfEntries = entries.length;
        callback(numberOfEntries);
      });
    },
    handleOpen(val) {
      if (val == "file") {
        this.$refs.inputFile.click();
      } else {
        this.$refs.inputFolder.click();
      }
    },
    uploadFiles(file, type) {
      const progressItem = {
        ...file,
        name: file.name,
        preview: type === "file" ? URL.createObjectURL(file) : "folder",
        fileLength: type === "file" ? "" : file.fileLength,
        process: 0,
        processFile: 0,
        isScan: false,
        isShowProgress: true,
      };
      const intervalId = setInterval(() => {
        if (type === "file") {
          progressItem.process += 20;
        } else if (progressItem.processFile <= progressItem.fileLength) {
          progressItem.processFile += 1;
          progressItem.process = Math.floor(
            (progressItem.processFile / progressItem.fileLength) * 100
          );
        }
        if (progressItem.process == 100) {
          clearInterval(intervalId);
          progressItem.isScan = true;
          const intervalScan = setTimeout(() => {
            if (progressItem.process < 100) {
              progressItem.process += 20;
              progressItem.processFile = Math.round(
                (progressItem.fileLength * progressItem.process) / 100
              );
            } else {
              clearTimeout(intervalScan);
              progressItem.isScan = false;
              progressItem.isShowProgress = false;
            }
          }, 3000);
        }
      }, 1000);
      this.files.push(progressItem);
    },
    handleChangeListFile(files, type) {
      if (type === "file") {
        files.forEach((item) => {
          this.uploadFiles(item, type);
        });
      } else {
        const progressItem = {
          name: files[0]?.webkitRelativePath
            ? files[0]?.webkitRelativePath.split("/")[0]
            : "Folder",
          fileLength: files.length,
        };
        this.uploadFiles(progressItem, type);
      }
    },
    handleDeleteFile(index) {
      this.files.splice(index, 1);
    },
  },
};
</script>

<style src="../assets/uploadFile.css" scoped />
