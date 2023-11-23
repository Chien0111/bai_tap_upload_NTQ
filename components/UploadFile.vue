<template>
  <div class="p-6">
    <div
      class="file-input-container"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        style="display: none"
        @change="handleFileChange"
        multiple
      />
      <input
        ref="folderInput"
        type="file"
        style="display: none"
        @change="handleFolderChange"
        webkitdirectory
        multiple
      />
      <div class="file-input-label">
        <span>Chọn tệp hoặc kéo và thả vào đây</span>
      </div>
      <button @click="openFilePicker" class="bg-gray-300 p-6 rounded m-2">
        UploadFile
      </button>
      <button @click="openFolderPicker" class="bg-gray-300 p-6 rounded m-2">
        UploadFolder
      </button>
      <div v-if="selectedFiles.length > 0">
        <p>Danh sách tệp đã chọn:</p>
      </div>
    </div>
    <ul class="border border-indigo-600 my-6">
      <li
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="p-2 flex item-center border-b-2 border-indigo-600"
      >
        <div>
          <img
            v-if="file.length > 0"
            src="../static/folder.png"
            alt=""
            class="w-[50px] h-[50px]"
          />
          <img
            v-else
            :src="file.previewSrc"
            :alt="file.name"
            class="w-[50px] h-[50px]"
          />
        </div>
        <div class="p-2 flex-1">
          <div class="flex justify-between">
            <span>
              {{ file.name }}
              <span v-if="file.uploadStatus" class="text-cyan-600">
                {{ file.uploadStatus }}</span
              >
              <span v-else-if="file.uploadProgress > 1" class="font-bold">{{
                file.uploadProgress + "%"
              }}</span>
              <span v-else class="text-amber-500">Pending</span>
            </span>
            <span>
              <span v-if="file.length" class="mr-2 font-bold text-xl"
                >/{{ file.length }}</span
              >
              <span class="hover:cursor-pointer" @click="removeFile(index)"
                >X</span
              >
            </span>
          </div>
          <div class="progress" v-if="file.uploadStatus !== 'Done'">
            <div
              v-if="file.uploadProgress !== undefined"
              :class="{
                'progress-bar': true,
                'progress-bar-striped': true,
                'mt-0': true,
                'h-[8px]': true,
                rounded: true,
                'progress-bar-animated': file.uploadProgress === 100,
              }"
              role="progressbar"
              aria-valuenow="75"
              aria-valuemin="0"
              aria-valuemax="100"
              :style="{ width: file.uploadProgress + '%' }"
            ></div>
          </div>
        </div>
      </li>
    </ul>
    <button class="bg-red text-white" @click="check">bg-indigo-500 </button>
  </div>
</template>

<script>
export default {
  name: "UploadFile",
  data() {
    return {
      selectedFiles: [],
      uploading: false,
      maxConcurrentUploads: 3,
    };
  },
  methods: {
    handleFileChange(event) {
      this.selectedFiles = [
        ...this.selectedFiles,
        ...this.getFileListFromEvent(event),
      ];
      this.uploadFiles();
    },

    handleFolderChange(event) {
      this.selectedFiles = [
        ...this.selectedFiles,
        [...this.getFileListFromEvent(event)],
      ];
      this.uploadFiles();
    },

    openFilePicker() {
      this.$refs.fileInput.click();
    },
    openFolderPicker() {
      this.$refs.folderInput.click();
    },

    handleDrop(event) {
      this.handleFileChange(event);
    },

    async uploadFiles() {
      while (this.uploading) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      this.uploading = true;

      try {
        const uploadPromises = [];

        for (let index = 0; index < this.selectedFiles.length; index++) {
          const file = this.selectedFiles[index];
          if (file.length) {
            for (const item of file) {
              await this.uploadProgress(item, index, 20);
            }
          }
          if (!file.previewSrc) {
            file.previewSrc = URL.createObjectURL(file);
          }

          if (file.uploadProgress === 100) {
            continue;
          }

          const uploadPromise = this.uploadFile(file, index);
          uploadPromises.push(uploadPromise);

          if (uploadPromises.length >= this.maxConcurrentUploads) {
            // Chờ tất cả các promises trong danh sách đồng thời hoàn thành
            await Promise.all(uploadPromises);
            uploadPromises.length = 0; // Đặt lại mảng promises
          }
        }

        // Chờ tất cả các promises còn lại (nếu có)
        await Promise.all(uploadPromises);
      } finally {
        this.uploading = false;
      }
    },

    async uploadFile(file, index) {
      const uploadPromise = new Promise((resolve) => {
        let percent = 0;
        const intervalId = setInterval(() => {
          percent += 20;
          this.uploadProgress(file, index, Math.min(percent, 100));

          if (percent >= 100) {
            clearInterval(intervalId);
            resolve();
          }
        }, 1000);
      });

      await uploadPromise;

      setTimeout(() => {
        this.$set(this.selectedFiles, index, {
          ...file,
          uploadProgress: 100,
          uploadStatus: "Scaning",
        });

        setTimeout(() => {
          this.$set(this.selectedFiles, index, {
            ...file,
            uploadProgress: 100,
            uploadStatus: "Done",
          });
        }, 500);
      }, 500);
    },

    async uploadProgress(file, index, progress) {
      return new Promise((resolve) => {
        this.$set(this.selectedFiles, index, {
          ...file,
          uploadProgress: progress,
        });

        resolve();
      });
    },

    getFileListFromEvent(event) {
      const fileList = event.dataTransfer
        ? event.dataTransfer.files
        : event.target.files;

      return Array.from(fileList).map((file) => ({
        name: file.name,
        previewSrc: URL.createObjectURL(file),
      }));
    },

    removeFile(index) {
      this.selectedFiles.splice(index, 1);
    },

    check() {
      console.log("this", this.selectedFiles);
    },
  },
};
</script>

<style src="../assets/uploadFile.css" scoped />
