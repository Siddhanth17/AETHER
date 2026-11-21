import * as T from "three";
const halfTurn = new T.Matrix4().makeRotationY(Math.PI);
/** Rigid transforms only: resizing an aperture must not scale the viewer's world. */
export function linkPortalCamera(
  viewer: T.PerspectiveCamera,
  source: T.Object3D,
  exit: T.Object3D,
  target: T.PerspectiveCamera,
) {
  viewer.updateMatrixWorld();
  source.updateMatrixWorld();
  exit.updateMatrixWorld();
  const position = new T.Vector3(),
    rotation = new T.Quaternion(),
    scale = new T.Vector3();
  source.matrixWorld.decompose(position, rotation, scale);
  const sourceRigid = new T.Matrix4().compose(
    position,
    rotation,
    new T.Vector3(1, 1, 1),
  );
  exit.matrixWorld.decompose(position, rotation, scale);
  const exitRigid = new T.Matrix4().compose(
    position,
    rotation,
    new T.Vector3(1, 1, 1),
  );
  target.matrix
    .copy(exitRigid)
    .multiply(halfTurn)
    .multiply(sourceRigid.invert())
    .multiply(viewer.matrixWorld);
  target.matrix.decompose(target.position, target.quaternion, scale);
  target.scale.set(1, 1, 1);
  target.projectionMatrix.copy(viewer.projectionMatrix);
  target.projectionMatrixInverse.copy(viewer.projectionMatrixInverse);
  target.updateMatrixWorld();
  const normal = new T.Vector3(0, 0, 1).applyQuaternion(
    source.getWorldQuaternion(new T.Quaternion()),
  );
  const front =
    normal.dot(
      viewer
        .getWorldPosition(new T.Vector3())
        .sub(source.getWorldPosition(new T.Vector3())),
    ) > 0.025;
  const exitNormal = new T.Vector3(0, 0, 1).applyQuaternion(
    exit.getWorldQuaternion(new T.Quaternion()),
  );
  return {
    front,
    plane: new T.Plane().setFromNormalAndCoplanarPoint(
      exitNormal,
      exit.getWorldPosition(new T.Vector3()).addScaledVector(exitNormal, 0.005),
    ),
  };
}
export function targetSize(width: number, height: number, budget: number) {
  const factor = budget / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * factor)),
    height: Math.max(1, Math.round(height * factor)),
  };
}
