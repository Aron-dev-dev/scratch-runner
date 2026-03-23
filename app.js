let vm;

function getProjectId(url) {
  const match = url.match(/projects\/(\d+)/);
  return match ? match[1] : null;
}

async function start() {
  const url = document.getElementById("url").value;
  const id = getProjectId(url);

  if (!id) {
    alert("Ongeldige link");
    return;
  }

  const canvas = document.getElementById("stage");

  vm = new window.VirtualMachine();

  // Renderer
  const renderer = new window.ScratchRender(canvas);
  vm.attachRenderer(renderer);

  // Audio
  const audioEngine = new window.AudioEngine();
  vm.attachAudioEngine(audioEngine);

  // Storage (BELANGRIJK voor zware projecten)
  const storage = new window.ScratchStorage();

  // Project data
  storage.addWebStore(
    [window.ScratchStorage.AssetType.Project],
    asset => `https://projects.scratch.mit.edu/${id}`
  );

  // Assets (sprites, sounds, etc.)
  storage.addWebStore(
    [
      window.ScratchStorage.AssetType.ImageVector,
      window.ScratchStorage.AssetType.ImageBitmap,
      window.ScratchStorage.AssetType.Sound
    ],
    asset => `https://assets.scratch.mit.edu/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`
  );

  vm.attachStorage(storage);

  vm.start();

  try {
    const res = await fetch(`https://projects.scratch.mit.edu/${id}`);
    const buffer = await res.arrayBuffer();

    await vm.loadProject(buffer);

    vm.setTurboMode(false); // stabieler voor zware projecten
    vm.greenFlag();

  } catch (e) {
    console.error(e);
    alert("Laden mislukt");
  }
}
