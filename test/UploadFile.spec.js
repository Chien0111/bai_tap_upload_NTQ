import { mount, shallowMount } from "@vue/test-utils";
import UploadFile from "@/components/UploadFile.vue";
import Home from "@/pages/index.vue";

describe("UploadFile", () => {
  it("Home", () => {
    const wrapper = mount(Home);
  });

  it("render button and input", () => {
    const wrapper = mount(UploadFile);
    expect(wrapper.findAll("button")).toHaveLength(2);
    expect(wrapper.findAll("input")).toHaveLength(2);
  });

  it("renders Upload file button and hidden file input", () => {
    const wrapper = mount(UploadFile);
    const fileBtn = wrapper.find("#btnInputFile");
    const fileInput = wrapper.find(
      'input[type="file"][name="file"][hidden="hidden"][id="inputFile"]'
    );

    expect(fileBtn.exists()).toBe(true);
    expect(fileBtn.text()).toBe("Upload file");
    expect(fileInput.exists()).toBe(true);
    expect(fileInput.attributes("multiple")).toBe("multiple");
  });

  it("renders Upload folder button and hidden folder input", () => {
    const wrapper = mount(UploadFile);
    const folderBtn = wrapper.find("#btnInputFolder");
    const folderInput = wrapper.find(
      'input[type="file"][name="file"][hidden="hidden"][webkitdirectory][id="inputFolder"]'
    );

    expect(folderBtn.exists()).toBe(true);
    expect(folderBtn.text()).toBe("Upload folder");
    expect(folderInput.exists()).toBe(true);
    expect(folderInput.attributes("multiple")).toBe("multiple");
  });

  it("test call function handleChangeFile when click button", () => {
    const wrapper = shallowMount(UploadFile);
    const handleClickSpy = jest.spyOn(wrapper.vm, "handleOpen");
    const findBtn = wrapper.findAll("button");

    findBtn.trigger("click");

    expect(handleClickSpy).toHaveBeenCalled();
    expect(handleClickSpy).toHaveBeenCalledTimes(2);

    handleClickSpy.mockRestore();
  });

  it("handles file input change", async () => {
    const wrapper = shallowMount(UploadFile);
    const mockFile = new File(["content"], "mockFileName");
    const mockEvent = { target: { files: [mockFile] } };
    const spyHandleChangeListFile = jest.spyOn(
      wrapper.vm,
      "handleChangeListFile"
    );
    await wrapper.vm.handleChangeFile(mockEvent);
    expect(spyHandleChangeListFile).toHaveBeenCalledWith([mockFile], "file");
    expect(wrapper.vm.$refs.inputFile.value).toBe("");
    spyHandleChangeListFile.mockRestore();
  });

  it("handles folder input change", async () => {
    const wrapper = shallowMount(UploadFile);
    const mockFile = new File(["content"], "exampleFolder", { type: "" });
    const mockEvent = { target: { files: [mockFile] } };
    jest.spyOn(wrapper.vm, "handleChangeListFile");
    await wrapper.vm.handleChangeFolder(mockEvent);
    expect(wrapper.vm.handleChangeListFile).toHaveBeenCalledWith(
      [mockFile],
      "folder"
    );
    expect(wrapper.vm.$refs.inputFolder.value).toBe("");
  });

  it("handles file and folder drop", async () => {
    const wrapper = shallowMount(UploadFile);
    const spyHandleChangeListFile = jest.spyOn(
      wrapper.vm,
      "handleChangeListFile"
    );
    const spyReadDirectory = jest.spyOn(wrapper.vm, "readDirectory");

    const mockEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        items: [
          {
            kind: "file",
            webkitGetAsEntry: jest.fn(() => ({ isDirectory: false })),
          },
          {
            kind: "file",
            webkitGetAsEntry: jest.fn(() => ({ isDirectory: true })),
          },
        ],
      },
    };

    await wrapper.vm.handleDrop(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(spyHandleChangeListFile).toHaveBeenCalled();
    expect(spyReadDirectory).toHaveBeenCalled();
  });
});

// data
// function : props, logic, return

// test 1: hien thi ban dau
// test 2: hanh dong - chon file, chon folder, keo tha file and folder

// chay file test kiem tra ket qua
